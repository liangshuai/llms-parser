declare module 'fs/promises' {
  export function readFile(path: string | URL | number, options?: { encoding?: string | null; flag?: string }): Promise<string | Buffer>;
}

declare module 'path' {
  export function resolve(...pathSegments: string[]): string;
  export function dirname(path: string): string;
  export function isAbsolute(path: string): boolean;
  export function join(...paths: string[]): string;
}

declare const process: {
  cwd(): string;
};
