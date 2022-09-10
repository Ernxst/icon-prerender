import { getNodeType, NODE_TYPE } from "@/filter/filter";
import { prerenderNode } from "@/prerender/util";
import { parse, preprocess, walk } from "svelte/compiler";
import type {
	Ast,
	Element,
	Script,
	Style,
	TemplateNode,
} from "svelte/types/compiler/interfaces";
import type { AstParser } from "../types";
import MagicString from "magic-string";

type ModuleNode = Script | Style | TemplateNode;
type HTMLNode = Element;

export function svelteParser(): AstParser<ModuleNode, HTMLNode, Ast> {
	return {
		parse(code) {
			return parse(code, {
				customElement: true,
			});
		},

		isHtmlFragment(node): node is HTMLNode {
			return "type" in node && node.type === "Element";
		},

		// Not needed
		traverse(_root, _cb, _options) {},

		toAst(node) {
			if (this.isHtmlFragment(node)) {
				// Disallows spread attributes on components - probably a later feature, easy to add
				// eslint-disable-next-line unicorn/no-array-reduce
				const attrs = node.attributes.reduce<Record<string, unknown>>(
					(attributes, attrNode) => {
						if (attrNode.type === "Attribute") {
							if (typeof attrNode.value === "boolean") {
								attributes[attrNode.name] = attrNode.value;
							} else {
								// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
								attributes[attrNode.name] = attrNode.value[0].raw;
							}
						}
						return attributes;
					},
					{}
				);

				return [
					{
						type: "tag",
						name: node.name,
						attrs,
						children: (node.children ?? []).flatMap((child) =>
							this.toAst(child)
						),
						voidElement: node.children !== undefined,
					},
				];
			}

			return [];
		},

		// eslint-disable-next-line sonarjs/cognitive-complexity
		async prerender(code, options) {
			const parseToAst = this.parse.bind(this);
			const toAst = this.toAst.bind(this);
			const isHtml = this.isHtmlFragment.bind(this);

			const { code: transformedCode } = await preprocess(code, {
				async markup({ content, filename }) {
					/**
					 * Idea:
					 *
					 * 1. Walk the AST
					 * 2. For any node to prerender:
					 *    - Generate the prerendered code
					 *    - Push this promise onto a stack
					 *    - Call replace({ ... }) to update the "start" and "end" properties
					 *    of all nodes in the AST
					 *    - This avoids having to use a regex to replace data
					 * 4. await until all promises are resolved
					 */
					const ast = parseToAst(content);
					const str = new MagicString(content, { filename });

					const patches: Promise<unknown>[] = [];

					walk(ast.html, {
						enter(node) {
							// @ts-expect-error Svelte compiler uses `BaseNode` which we cannot access
							if (isHtml(node)) {
								const tree = toAst(node);

								if (tree.length === 1) {
									const astNode = tree[0];

									if (astNode.type === "tag") {
										const nodeType = getNodeType(astNode, options);

										if (nodeType !== NODE_TYPE.IGNORED) {
											const promise = prerenderNode({
												node: astNode,
												...options,
											}).then((transformed) => {
												const { start, end } = node;
												str.overwrite(start, end, transformed);

												// Replace updates the "start" and "end" properties for all other nodes
												this.replace({
													type: "fragment",
													range: [start, transformed.length],
												});
											});

											patches.push(promise);
										}
									}
								}
							}
						},
					});

					await Promise.all(patches);

					return { code: str.toString() };
				},
			});

			return transformedCode;
		},
	};
}
