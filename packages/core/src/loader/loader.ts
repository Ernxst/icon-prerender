import { ICON_ATTRIBUTE } from "@/filter/filter";
import type { PrerenderOptions } from "@/prerender/util";
import { readFile } from "node:fs/promises";
import { typescriptParser } from "./parsers/typescript";
import { isComponentFile } from "./util";
import path from "node:path";
import { mdParser } from "./parsers/md";
import type { GenericParser } from "./parsers/types";
import { svelteParser } from "./parsers/svelte";

interface LoaderOptions extends PrerenderOptions {}

/**
 * typescript parser works with all files except:
 * 	- .md
 * 	- .mdx
 * 	- .svelte
 */
const PARSERS: Partial<Record<string, GenericParser>> = {
	".md": mdParser(),
	".mdx": mdParser(),
	".svelte": svelteParser(),
	".svx": svelteParser(),
};

/**
 * Attempt to access source code to replace any HTML fragments there, before
 * the module is transformed by other plugins
 *
 * @param id file path
 * @param opts
 * @returns
 */
export async function useLoader(id: string, opts: LoaderOptions) {
	if (isComponentFile(id)) {
		let code = await readFile(id, "utf8");

		// Don't waste time operating on files that definitely have no icons
		if (code.includes(ICON_ATTRIBUTE) || code.includes("<use")) {
			const { ext } = path.parse(id);
			const parser = PARSERS[ext] ?? typescriptParser();
			code = await parser.prerender(code, opts);
		}

		return {
			code,
			// Let sourcemaps be handled elsewhere
			map: null,
		};
	}

	return null;
}
