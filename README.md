# llms-parser

TypeScript utilities for parsing `llms.txt` documents from a URL or local filesystem path. The parser extracts the project header, summary, info block, and each H2 section, returning a structured object. It can also follow links inside optional content or file list sections to recursively parse nested llms documents.

## Usage

```ts
import { parseLlmsFromSource } from './dist';

const doc = await parseLlmsFromSource('https://example.com/llms.txt');
console.log(doc.title);
```

### API

- `parseLlmsFromSource(source, options?)`: Fetches and parses a remote or local `llms.txt`, following nested links that look like llms descriptors or text files inside optional/file sections.
- `parseLlmsText(text)`: Parses provided llms content without fetching.

### Options

- `followNested` (default `true`): Whether to fetch linked llms documents.
- `maxDepth` (default `3`): Maximum recursion depth.
- `shouldFollowLink(link, section)`: Custom predicate to choose which links to follow.
- `fetchImpl` / `requestInit`: Supply a custom `fetch` (e.g., with a proxy agent) and request options for environments where direct HTTPS access is blocked.

### Build

```
npm run build
```

Compilation outputs to `dist/`.
