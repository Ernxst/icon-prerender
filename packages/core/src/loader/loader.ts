import { ICON_ATTRIBUTE, ICON_NODE_NAMES } from "@/filter/filter";
import HTML from "html-parse-stringify";
import { isComponentFile } from "./util";
import { findTags } from "@/ast-helpers";
import { processNodes } from "./process-node";
import type { PrerenderOptions } from "@/prerender/util";
import { readFile } from "node:fs/promises";

interface LoaderOptions extends PrerenderOptions {}

/**
 * Attempt to access source code to replace any HTML fragments there, before
 * the module is transformed by other plugins
 *
 * @param id
 * @param opts
 * @returns
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export async function useLoader(id: string, opts: LoaderOptions) {
	if (isComponentFile(id)) {
		let code = await readFile(id, "utf8");

		// Don't waste time operating on files with no icons
		if (code.includes(ICON_ATTRIBUTE) || code.includes("<use")) {
			/**
			 * Idea:
			 *
			 * 1. Split source code (yes, that includes with js) into HTML ast
			 *   - This works because html-parse-stringify treats non-html as a text
			 *     node which we simply ignore
			 * 2. Iterate through nodes of type "tag" - these are the nodes
			 *    containing some form of HTML
			 * 3. Transform the HTML fragment as usual
			 * 4. Replace HTML fragment in the source code with the transformed version
			 */
			const moduleAst = HTML.parse(code);

			for (const node of moduleAst) {
				// We've found some HTML within the file
				if (node.type === "tag") {
					// Check if the node is an icon node itself
					code = await processNodes({
						iconNodes: [node],
						sourceCode: code,
						pluginOptions: opts,
					});

					// Or if it's children contain icon nodes
					for (const tagName of ICON_NODE_NAMES) {
						const iconNodes = findTags(tagName, node, { recursive: true });
						code = await processNodes({
							iconNodes,
							sourceCode: code,
							pluginOptions: opts,
						});
					}
				}
			}
		}

		return {
			code,
			// Let sourcemaps be handled elsewhere
			map: null,
		};
	}

	return null;
}
