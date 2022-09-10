import type { AstParser } from "../types";
import { remark } from "remark";
import { getNodeType, NODE_TYPE } from "@/filter/filter";
import { prerenderNode } from "@/prerender/util";
import HTML from "html-parse-stringify";

// Remark doesn't export the node types it uses ...
type RootNode = ReturnType<typeof remark["parse"]>;
type MdNode = RootNode["children"][number];
type HtmlNode = Extract<MdNode, { type: "html" }>;

export function mdParser(): AstParser<MdNode, HtmlNode, RootNode> {
	return {
		parse(code) {
			// Do not strip whitespace as AST parser needs this to separate nodes
			// Remove all comments - AST parser doesn't work if comments are at top of file
			// eslint-disable-next-line unicorn/no-unsafe-regex
			code = code.replaceAll(/<!--(.*)?-->/g, "\n");
			return remark.parse(code);
		},

		isHtmlFragment(node): node is HtmlNode {
			return node.type === "html";
		},

		traverse(node, cb, options) {
			const { recursive = false } = options ?? {};
			cb(node);

			if (recursive && "children" in node) {
				const { children } = node;
				void children.map((child) => this.traverse(child, cb, options));
			}
		},

		toAst(node) {
			if ("value" in node) {
				return HTML.parse(node.value);
			}

			if ("children" in node) {
				return node.children.flatMap((n) => this.toAst(n));
			}

			return [];
		},

		async prerender(code, options) {
			const moduleAst = this.parse(code);
			/**
			 * Since we cannot have async callbacks in `traverse` store the promises
			 * and resolve them after
			 */
			const promises: Promise<unknown>[] = [];

			this.traverse(
				moduleAst,
				(node) => {
					if (this.isHtmlFragment(node)) {
						const tree = this.toAst(node);
						// Only deal with single elements, not fragments
						if (tree.length === 1) {
							const ast = tree[0];
							if (ast.type === "tag") {
								const nodeType = getNodeType(ast);

								if (nodeType !== NODE_TYPE.IGNORED) {
									const promise = prerenderNode({
										node: ast,
										...options,
									}).then((c) => {
										node.value = c;
									});
									promises.push(promise);
								}
							}
						}
					}
				},
				{ recursive: true }
			);

			await Promise.all(promises);
			return remark.stringify(moduleAst);
		},
	};
}
