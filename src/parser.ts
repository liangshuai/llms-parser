import { readFile } from 'fs/promises';
import path from 'path';

export interface LlmsLink {
  title: string;
  url: string;
  description?: string;
  resolvedUrl: string;
  nested?: LlmsDocument;
  nestedError?: string;
}

export interface LlmsSection {
  title: string;
  items: LlmsLink[];
}

export interface LlmsDocument {
  title: string;
  summary?: string;
  info?: string;
  sections: LlmsSection[];
  source: string;
}

export interface ParseOptions {
  followNested?: boolean;
  maxDepth?: number;
  shouldFollowLink?: (link: LlmsLink, section: LlmsSection) => boolean;
  visited?: Set<string>;
  baseContext?: SourceContext;
  depth?: number;
}

type SourceContext = { kind: 'url' | 'file'; base: string };

type ResolvedSource = { target: string; canonical: string; context: SourceContext };

const DEFAULT_MAX_DEPTH = 3;

export async function parseLlmsFromSource(source: string, options: ParseOptions = {}): Promise<LlmsDocument> {
  const visited = options.visited ?? new Set<string>();
  const resolved = resolveSource(source, options.baseContext);
  const depth = options.depth ?? 0;

  if (visited.has(resolved.canonical)) {
    throw new Error(`Cycle detected while parsing ${resolved.canonical}`);
  }

  visited.add(resolved.canonical);
  const raw = await loadSource(resolved);
  const parsed = parseLlmsText(raw, resolved.target);

  const sections = await enrichSections(parsed.sections, {
    ...options,
    depth,
    baseContext: resolved.context,
    visited
  });

  return { ...parsed, sections, source: resolved.target };
}

export function parseLlmsText(text: string, sourceLabel = 'inline'): Omit<LlmsDocument, 'source'> {
  const normalized = text.replace(/\r\n/g, '\n');
  const { header, body } = splitHeader(normalized);
  const { title, summary, info } = parseHeader(header, sourceLabel);
  const sections = parseSections(body);
  return { title, summary, info, sections };
}

function splitHeader(text: string): { header: string; body: string } {
  const firstH2 = text.match(/^##\s+/m);
  if (!firstH2 || firstH2.index === undefined) {
    return { header: text.trim(), body: '' };
  }

  const idx = firstH2.index;
  return {
    header: text.slice(0, idx).trim(),
    body: text.slice(idx).trim()
  };
}

function parseHeader(block: string, sourceLabel: string): { title: string; summary?: string; info?: string } {
  const rawLines = block.split(/\n/);
  const lines = rawLines.filter((line, idx) => !(idx === rawLines.length - 1 && line.trim() === ''));

  if (!lines[0]?.startsWith('#')) {
    throw new Error(`Expected H1 title at the top of ${sourceLabel}`);
  }

  const title = lines[0].replace(/^#\s*/, '').trim();
  let cursor = 1;
  const summaryLines: string[] = [];

  while (cursor < lines.length && /^>\s*/.test(lines[cursor])) {
    summaryLines.push(lines[cursor].replace(/^>\s*/, '').trim());
    cursor += 1;
  }

  while (cursor < lines.length && lines[cursor].trim() === '') {
    cursor += 1;
  }

  const info = lines.slice(cursor).join('\n').trim() || undefined;

  return {
    title,
    summary: summaryLines.length ? summaryLines.join('\n') : undefined,
    info
  };
}

function parseSections(text: string): LlmsSection[] {
  const sections: LlmsSection[] = [];
  const regex = /^##\s*(.+)$/gm;
  let match: RegExpExecArray | null;
  const indices: Array<{ title: string; start: number; end: number }> = [];

  while ((match = regex.exec(text)) !== null) {
    const title = match[1].trim();
    const start = match.index + match[0].length;
    indices.push({ title, start, end: 0 });
  }

  for (let i = 0; i < indices.length; i += 1) {
    indices[i].end = i + 1 < indices.length ? indices[i + 1].start : text.length;
  }

  if (!indices.length && text.trim()) {
    return [];
  }

  for (const entry of indices) {
    const body = text.slice(entry.start, entry.end).trim();
    sections.push({ title: entry.title, items: parseLinks(body) });
  }

  return sections;
}

function parseLinks(body: string): LlmsLink[] {
  const links: LlmsLink[] = [];
  const linkRegex = /^-\s*\[(?<title>[^\]]+)\]\((?<url>[^)]+)\)(?::\s*(?<desc>.*))?$/gm;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(body)) !== null) {
    links.push({
      title: match.groups?.title?.trim() ?? '',
      url: match.groups?.url?.trim() ?? '',
      description: match.groups?.desc?.trim() || undefined,
      resolvedUrl: ''
    });
  }

  return links;
}

async function enrichSections(sections: LlmsSection[], options: ParseOptions): Promise<LlmsSection[]> {
  const followNested = options.followNested ?? true;
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const depth = options.depth ?? 0;

  if (!followNested || depth >= maxDepth) {
    return sections.map(section => ({
      ...section,
      items: section.items.map(item => ({ ...item, resolvedUrl: resolveLink(item.url, options.baseContext).target }))
    }));
  }

  const enriched = await Promise.all(
    sections.map(async section => {
      const items = await Promise.all(
        section.items.map(item => enrichLink(item, section, options))
      );
      return { ...section, items };
    })
  );

  return enriched;
}

async function enrichLink(link: LlmsLink, section: LlmsSection, options: ParseOptions): Promise<LlmsLink> {
  const resolved = resolveLink(link.url, options.baseContext);
  const shouldFollow = options.shouldFollowLink
    ? options.shouldFollowLink(link, section)
    : defaultShouldFollow(resolved.target, section.title);

  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const depth = options.depth ?? 0;

  if (!shouldFollow || depth >= maxDepth) {
    return { ...link, resolvedUrl: resolved.target };
  }

  const visited = options.visited ?? new Set<string>();
  if (visited.has(resolved.canonical)) {
    return { ...link, resolvedUrl: resolved.target, nestedError: 'Cycle detected' };
  }

  try {
    const nested = await parseLlmsFromSource(resolved.target, {
      ...options,
      baseContext: resolved.context,
      depth: depth + 1,
      visited
    });
    return { ...link, resolvedUrl: resolved.target, nested };
  } catch (error) {
    const nestedError = error instanceof Error ? error.message : String(error);
    return { ...link, resolvedUrl: resolved.target, nestedError };
  }
}

function defaultShouldFollow(target: string, sectionTitle: string): boolean {
  const lower = target.toLowerCase();
  const sectionLower = sectionTitle.toLowerCase();
  const looksLikeLlms = lower.endsWith('llms.txt') || lower.endsWith('.llms') || lower.includes('llms.txt');
  const looksText = lower.endsWith('.txt');
  const optionalSection = sectionLower.includes('optional') || sectionLower.includes('file');
  return looksLikeLlms || (optionalSection && looksText);
}

function resolveLink(link: string, baseContext?: SourceContext): ResolvedSource {
  if (isHttp(link)) {
    const canonical = normalizeUrl(link);
    return { target: canonical, canonical, context: { kind: 'url', base: canonical } };
  }

  if (baseContext?.kind === 'url') {
    const targetUrl = new URL(link, ensureTrailingSlash(baseContext.base)).toString();
    return { target: targetUrl, canonical: normalizeUrl(targetUrl), context: { kind: 'url', base: targetUrl } };
  }

  const basePath = baseContext?.kind === 'file' ? baseContext.base : process.cwd();
  const resolvedPath = path.resolve(basePath, link);
  const canonical = resolvedPath;
  return { target: resolvedPath, canonical, context: { kind: 'file', base: path.dirname(resolvedPath) } };
}

function resolveSource(source: string, baseContext?: SourceContext): ResolvedSource {
  const resolved = resolveLink(source, baseContext);
  if (resolved.context.kind === 'file') {
    resolved.context = { kind: 'file', base: path.dirname(resolved.target) };
  }
  return resolved;
}

async function loadSource(resolved: ResolvedSource): Promise<string> {
  if (resolved.context.kind === 'url') {
    const response = await fetch(resolved.target);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${resolved.target}: ${response.status} ${response.statusText}`);
    }
    return response.text();
  }

  const data = await readFile(resolved.target, { encoding: 'utf-8' });
  if (typeof data === 'string') return data;
  return data.toString('utf-8');
}

function isHttp(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function normalizeUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = '';
    return url.toString();
  } catch {
    return value;
  }
}

function ensureTrailingSlash(value: string): string {
  if (value.endsWith('/')) return value;
  const lastSlash = value.lastIndexOf('/');
  if (lastSlash > value.indexOf('://') + 2) return value.slice(0, lastSlash + 1);
  return `${value}/`;
}
