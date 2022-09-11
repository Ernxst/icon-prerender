# icon-prerender

## 0.1.2

### Patch Changes

- [`0562a77`](https://github.com/Ernxst/icon-prerender/commit/0562a77a4cfd0462aa09412ccb26165a69c25123) Thanks [@Ernxst](https://github.com/Ernxst)! - chore: downgrade tsup version

## 0.1.1

### Patch Changes

- [`8b811a9`](https://github.com/Ernxst/icon-prerender/commit/8b811a941eead2cb8bffa251b2d456edaf7ed7bc) Thanks [@Ernxst](https://github.com/Ernxst)! - fix(astro): remove `async` code in `astro dev`

  fix(astro): fixes to code parsing

  - add spaces after comments so `html-parse-stringify` does not parse all elements as comments
  - do not strip control characters during development
  - parse _all_ nodes during development

## 0.1.0

### Minor Changes

- [`9654b3c`](https://github.com/Ernxst/icon-prerender/commit/9654b3c07f9174ba5445fecd3c9e9d94bfc8f550) Thanks [@Ernxst](https://github.com/Ernxst)! - feat: use AST parsers to transform source code

  - This makes the transformation much less likely to replace the wrong element in the source code
  - To implement a parser for a new file type, it must simply implement the `AstParser` interface
  - Currently, parsers for markdown and svelte files are included
  - A TypeScript parser is also included which can handle any JSX (and Vue SFCs)
  - The `astro` version of the plugin does not use an AST as it works with regular HTML

  fix: `.mts`, `.cts`, `.mjs`, `.cjs`, `.ejs`, and `.pug` files are no longer processed by `icon-prerender`

  chore: add more content to the `.md` components for testing

## 0.0.3

### Patch Changes

- [`fe54c01`](https://github.com/Ernxst/icon-prerender/commit/fe54c013b3ba746c3186a594a85389f1cf3d90f9) Thanks [@Ernxst](https://github.com/Ernxst)! - fix: enable plugin during development
  fix: enable plugin for SPAs

  - Previously, the plugin only worked during static builds
  - This patch enables prerendering during development and for SPAs

## 0.0.2

### Patch Changes

- [`468f71c`](https://github.com/Ernxst/icon-prerender/commit/468f71c43db63d57a713b81ddb9e85ec757acf4a) Thanks [@Ernxst](https://github.com/Ernxst)! - Initial release
