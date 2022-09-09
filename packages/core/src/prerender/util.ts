import { findTags } from "@/ast-helpers";
import { getNodeType, NODE_TYPE } from "@/filter/filter";
import { loadSvgToNode } from "@/resolve/load";
import type { IconPrerenderPluginOptions } from "@/types";
import HTML from "html-parse-stringify";

export interface PrerenderOptions extends IconPrerenderPluginOptions {
	/**
	 * Build output directory where HTML files are located
	 */
	outDir: string;
}

export interface PrerenderNodeOptions extends PrerenderOptions {
	node: TagAstElement;
}

/**
 * Prerender the icons for a given AST node and return the transformed
 * HTML string.
 *
 * Used to replace fragments of HTML source code
 * @param options
 * @returns
 */
export async function prerenderNode(options: PrerenderNodeOptions) {
	const { node, ...opts } = options;
	await traverse(node, opts);
	// We operate on the AST in place, so `node` will be up to date
	return HTML.stringify([node]);
}

/**
 * Traverse the `node` AST for any icons to transform
 *
 * @param node
 * @param options
 * @returns Whether or not the node was transformed
 */
export async function traverse(
	node: TagAstElement,
	options: PrerenderOptions
): Promise<boolean> {
	let replaced = false;
	const { outDir, ...opts } = options;
	const nodeType = getNodeType(node, opts);

	// Handle children first
	if (node.children.length > 0) {
		const children = node.children.filter((t) => t.type === "tag");
		const anyReplaced = await Promise.all(
			children.map((c) => traverse(c as never, options))
		);
		replaced = anyReplaced.some(Boolean);
	}

	if (nodeType !== NODE_TYPE.IGNORED) {
		const svg = await loadSvgToNode(node, nodeType, outDir);
		mergeNodes(node, nodeType, svg);
		replaced = true;
	}

	return replaced;
}

/**
 * Remove the `<use>` tag inside an `<svg>` element
 * @param node
 */
function removeInnerUseTag(node: TagAstElement) {
	const [useTag] = findTags("use", node);
	if (useTag) {
		const idx = node.children.indexOf(useTag);
		node.children.splice(idx, 1);
	}
}

function mergeNodes(
	defaultNode: TagAstElement,
	nodeType: NODE_TYPE,
	...nodes: AstElement[]
) {
	if (nodeType === NODE_TYPE.USE_HREF) {
		removeInnerUseTag(defaultNode);
	}

	for (const node of nodes) {
		defaultNode.type = "tag";
		defaultNode.voidElement = false;

		if ("name" in node) {
			defaultNode.name = node.name;
		}

		if ("children" in node) {
			defaultNode.children = [...defaultNode.children, ...node.children];
		}

		if ("attrs" in node) {
			const defaultAttrs = defaultNode.attrs;
			const nodeAttrs = node.attrs;

			defaultNode.attrs = {
				...nodeAttrs,
				...defaultAttrs,
			};

			// Ensure class name is captured from both nodes
			if ("class" in nodeAttrs) {
				const suffix = defaultAttrs.class
					? ` ${defaultAttrs.class as string}`
					: "";
				defaultNode.attrs.class = `${nodeAttrs.class as string}${suffix}`;
			}
		}
	}
}
