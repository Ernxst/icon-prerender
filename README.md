[![codecov](https://codecov.io/gh/Ernxst/icon-prerender/branch/main/graph/badge.svg?token=4FA8D7L8DL)](https://codecov.io/gh/Ernxst/icon-prerender)

[![🚀 CI](https://github.com/Ernxst/icon-prerender/actions/workflows/ci.yml/badge.svg)](https://github.com/Ernxst/icon-prerender/actions/workflows/ci.yml)

# 🚀 Icon Prerender

A framework-agnostic plugin (likely compatible with your build tool) that prerenders your SVG icons at build time so your clients don't have to fetch them during browsing. Designed for ease-of-use and maximum performance.

## Why?

There are several icon libraries out there. However, it is rare to find one that ticks all the following:

- Works at build time (to minimise bundle size)
- Does not affect your bundle size at all
- Optimises SVGs at build time
- Requires no configuration or fiddling with other configuration options
- Allows you to simply specify icons in the template e.g., `mdi:chevron-right
- Does not require importing a bunch of components or creating icon sets

This library is heavily inspired by [`astro-icon`](https://github.com/natemoo-re/astro-icon) and essentially works the same except:

- `icon-prerender` works for any framework, even raw HTML (provided you use a bundler)
- `astro-icon` provides icon components - `icon-prerender` allows you to use just HTML
- `icon-prerender` provides much more flexibility on how icons are specified
- `icon-prerender` allows you to inline raw SVG elements

Again, [`astro-icon`](https://github.com/natemoo-re/astro-icon) works in this way, but only supports `.astro` components and [does not work with server-side rendering](https://github.com/natemoo-re/astro-icon/issues/35).

## Installation

This plugin requires [`@iconify/json`](https://www.npmjs.com/package/@iconify/json) as a peer dependency:

```bash
npm i --save-dev icon-prerender @iconify/json
```

```bash
yarn add -D icon-prerender @iconify/json
```

```bash
pnpm i -D icon-prerender @iconify/json
```

I also recommend installing and enabling the [`iconify-intellisense`](https://marketplace.visualstudio.com/items?itemName=antfu.iconify) VSCode extension by [Anthony Fu](https://github.com/antfu).

## Usage

In the template, you can define an icon to prerender as either:

- One of the following HTML elements _with_ a `data-icon` attribute:
  - `<div>`
  - `<span>`
  - `<figure>`
  - `<img>`
  - `<svg>`
  - any custom element tag
- Any `<svg />` element wrapped around a `use` tag with either a `href` or `xlink:href` attribute i.e.:

```html
<svg>
  <use href="assets/icon.svg#id"></use>
</svg>
```

- Note that for it to be valid HTML, you need to point to the ID of the element in the SVG file
- This suffix is stripped when resolving the path to the raw SVG item

This last feather sets `icon-prerender` from other icon libraries as this is valid HTML - if you disabled `icon-prerender`, the above would still work (assuming the `href` points to a valid path). The only difference would be it would have to make an extra network request during runtime to fetch the SVG and would then have to render it.

So, the cases above describe the default resolution algorithm; by default, these are the only elements that will be transformed into `<svg />` elements. See ["Configuration"](#configuration) to see how this can be changed.

Additionally, the `data-icon` attribute can either be:

- A `[pack]:[name]` string specifying the icon pack and the specific icon in the pack
- A relative path to a `.svg` file
  - Note that this is relative to the build output directory - you can modify the asset chunk names to make the filenames more predictable if needed
  - This also means there is no need to register icon sets - just set the path to the SVG file and it will be inlined
- An external URL pointing to an SVG file - this can be an API endpoint or simply a statically hosted SVG file
  - The API **must** return an raw SVG (not JSON or HTML) and must contain `svg` in the `content-type` header

Whatever you provide to `data-icon` will be resolved and prerendered at build time.

Any attributes defined on the original element (apart from `data-icon` unless it is a `[pack]:[name]` string) will be preserved and will override identical attributes in the resolved SVG element, except:

- The `class` will be concatenated from both elements
- Any children will be merged from both elements with children in the resolved SVG appearing lower in the template
  - In the case of a `<use>` tag wrapped inside an `<svg>`, the `<use>` tag will be removed

Note that icons can be nested inside each other, however, children will be resolved first. So the innermost icon will be prerendered first.

Then, you use the include the appropriate plugin with in your bundler's config:

### Astro

 ```js
import { defineConfig } from "astro/config";
import icons from "icon-prerender/astro";

export default defineConfig({
  integrations: [icons()],
})
```

### Vite

 ```js
import { defineConfig } from "vite";
import icons from "icon-prerender/vite";

export default defineConfig({
  plugins: [icons()],
})
```

### Rollup

 ```js
import { defineConfig } from "rollup";
import icons from "icon-prerender/rollup";

export default defineConfig({
  plugins: [icons()],
})
```

### esbuild

 ```js
import esbuild from "esbuild";
import icons from "icon-prerender/esbuild";

esbuild.build({
  plugins: [icons()],
}).catch(() => process.exit(1));
```

### Webpack

In CommonJS form:

```js
const IconPrerenderPluginWebpackPlugin = require("icon-prerender/webpack");

module.exports = {
  plugins: [new IconPrerenderPluginWebpackPlugin()],
}
```

## Configuration

- `include` - A regex, an array of strings (or regexes) of HTML attributes (can be custom) to
  filter elements on
  - If an attribute of any HTML element matches anything inside this array, it will be transformed into an SVG element.
  - default `undefined` - enables default filtering

- `exclude` - A regex, an array of strings (or regexes) of HTML attributes (can be custom) to
  filter elements on
  - If an attribute of any HTML element matches anything inside this array, it **will not** be transformed into an SVG element.
  - default: `undefined` - enables default filtering

Note: specifying `include` or `exclude` will not override default filtering - they are used to either include extra elements, or exclude elements that would have been included for transformation by default.

## Roadmap

- [ ] Allow consumers to disable default resolution via a new plugin option

  - Completely custom resolution would then be achieved by simply using `include` and `exclude` in tandem with this new plugin option

Have any other ideas? Make a suggestion in the [Discussions](https://github.com/Ernxst/icon-prerender/discussions) tab.

## Contributing

To get started with development, you will need an editor (VS Code is recommended), a browser that runs JavaScript and some extra prerequisites:

- [Node.js (>= 16)](https://nodejs.org)
- [pnpm 7.5.2](https://pnpm.io/installation#using-corepack)

To get started with contributing to this project, first fork this git repository:

```sh
git clone https://github.com/Ernxst/icon-prerender.git
```

Then, install dependencies and start coding.

### Submitting Improvements

If you have a suggestion that would make this app better, please fork the repo and create a pull request. You can also
simply open an issue with the tag "`enhancement`".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.
