---
"icon-prerender": minor
---

feat: use AST parsers to transform source code

- This makes the transformation much less likely to replace the wrong element in the source code
- To implement a parser for a new file type, it must simply implement the `AstParser` interface
- Currently, parsers for markdown and svelte files are included
- A TypeScript parser is also included which can handle any JSX (and Vue SFCs)
- The `astro` version of the plugin does not use an AST as it works with regular HTML

fix: `.mts`, `.cts`, `.mjs`, `.cjs`, `.ejs`, and `.pug` files are no longer processed by `icon-prerender`

chore: add more content to the `.md` components for testing
