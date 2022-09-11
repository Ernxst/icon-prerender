---
"icon-prerender": patch
---

fix(astro): remove `async` code in `astro dev`

fix(astro): fixes to code parsing

- add spaces after comments so `html-parse-stringify` does not parse all elements as comments
- do not strip control characters during development
- parse _all_ nodes during development
