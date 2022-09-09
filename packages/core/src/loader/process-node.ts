import { getNodeType, NODE_TYPE } from "@/filter/filter";
import type { PrerenderNodeOptions } from "@/prerender/util";
import { prerenderNode } from "@/prerender/util";
import { PLUGIN_NAME } from "@/types";
import { buildWhitespacedRegex } from "./util";
import HTML from "html-parse-stringify";

interface ProcessOptions {
	iconNodes: TagAstElement[];
	sourceCode: string;
	pluginOptions: Omit<PrerenderNodeOptions, "node">;
}

export async function processNodes(options: ProcessOptions) {
	const { iconNodes, sourceCode, pluginOptions } = options;
	let code = sourceCode;

	for (const childNode of iconNodes) {
		const fragment = HTML.stringify([childNode]);
		const nodeType = getNodeType(childNode, pluginOptions);

		if (nodeType !== NODE_TYPE.IGNORED) {
			const prerendered = await prerenderNode({
				node: childNode,
				...pluginOptions,
			});

			const regex = buildWhitespacedRegex(fragment);
			// Will test the regex in isolation
			/* istanbul ignore next */
			if (!regex.test(code)) {
				console.warn(
					`[${PLUGIN_NAME}]: could not prerender element \n\n${fragment}\n
  - this is a problem with the HTML AST parser
	- please raise this as an issue on GitHub at https://github.com/Ernxst/icon-prerender/issues and provide the HTML shown above in the post `
				);
			}

			code = code.replace(regex, prerendered);
		}
	}

	return code;
}
