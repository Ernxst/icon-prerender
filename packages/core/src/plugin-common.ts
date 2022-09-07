import glob from "fast-glob";
import HTML from "html-parse-stringify";
import fs from "node:fs";
import path from "node:path";
import { findTags } from "./ast-helpers";
import { getNodeType, NODE_TYPE } from "./filter/filter";
import { loadSvg } from "./resolve/load";
import { readRawSvgFromFile } from "./resolve/util";
import type { SvgPrerenderPluginOptions } from "./types";

interface PrerenderSvgOptions extends SvgPrerenderPluginOptions {
	/**
	 * Build output directory where HTML files are located
	 */
	outDir: string;
}

export async function prerender(options: PrerenderSvgOptions) {
	const { outDir } = options;
	const htmlFiles = await glob(path.join(outDir, "**", "*.html"));

	await Promise.all(
		htmlFiles.map(async (file) => {
			let replaced = true;
			const content = await readRawSvgFromFile(file);

			const [doctype] = HTML.parse(content);
			const [htmlTag] = findTags("html", doctype);
			const [body] = findTags("body", htmlTag);

			replaced = await traverse(body, options);

			if (replaced) {
				/**
				 * Can't use the `doctype` AST node since it contains { attrs: { html: '' } }
				 * which is stringified into <!DOCTYPE html=""> (instead of
				 * <!DOCTYPE html>) which is invalid HTML.
				 */
				const replacedContent = `<!DOCTYPE html>\n${HTML.stringify([htmlTag])}`;
				await fs.promises.writeFile(file, replacedContent);
			}
		})
	);
}

/**
 * Traverse the `node` AST for any SVG icons to transform
 *
 * @param node
 * @param options
 * @returns Whether or not the node was transformed
 */
async function traverse(
	node: TagAstElement,
	options: PrerenderSvgOptions
): Promise<boolean> {
	let replaced = false;
	const { include, exclude, outDir } = options;
	const nodeType = getNodeType(node, { include, exclude });

	// Handle children first
	if (node.children.length > 0) {
		const children = node.children.filter((t) => t.type === "tag");
		const anyReplaced = await Promise.all(
			children.map((c) => traverse(c as never, options))
		);
		replaced = anyReplaced.some(Boolean);
	}

	if (nodeType !== NODE_TYPE.IGNORED) {
		const svg = await loadSvg(node, nodeType, outDir);
		mergeNodes(node, svg);
		replaced = true;
	}

	return replaced;
}

function mergeNodes(defaultNode: TagAstElement, ...nodes: AstElement[]) {
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
