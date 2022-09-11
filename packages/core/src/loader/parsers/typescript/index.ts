import { getNodeType, NODE_TYPE } from "@/filter/filter";
import { prerenderNode } from "@/prerender/util";
import ts from "typescript";
import type { JsxNode, TsParser } from "./visitor";
import { createTsVisitor } from "./visitor";
import { createPrerenderTsNode, replacePlaceholders } from "./util";

export function typescriptParser(): TsParser {
	return {
		isHtmlFragment(node): node is JsxNode {
			return (
				ts.isJsxElement(node) ||
				ts.isJsxSelfClosingElement(node) ||
				ts.isJsxFragment(node)
			);
		},

		parse(code) {
			return ts.createSourceFile(
				"",
				code,
				ts.ScriptTarget.Latest,
				true,
				ts.ScriptKind.JSX
			);
		},

		traverse(node, cb, options) {
			const { recursive = false } = options ?? {};
			cb(node);

			if (recursive) {
				const children = node.getChildren();
				void children.map((child) => this.traverse(child, cb, options));
			}
		},

		toAst(node) {
			const result: AstElement[] = [];
			const visitor = createTsVisitor(this, node, result);
			visitor.visit();
			return result;
		},

		// eslint-disable-next-line sonarjs/cognitive-complexity
		async prerender(code, options) {
			/**
			 *
			 * IDEA:
			 *
			 * 1. Visit each node in the AST of the entire source code
			 * 2. If the node is a JSX element and should be prerendered,
			 *    generate an ID for this element
			 * 3. Store the ID, along with a promise resolved to the transformed code in a cache
			 * 4. Replace the node (in place) with a placeholder with the ID as an attribute
			 * 5. Get the newly transformed AST
			 * 6. Replace the placeholders with the resolved promises
			 *
			 * The TS compiler API does not allow async/await in transformer visitors,
			 * otherwise we could just patch the node in place without first replacing
			 * it with a placeholder
			 */
			const placeholders: Record<string, Promise<string>> = {};
			let idx = 0;

			const transformer: ts.TransformerFactory<ts.SourceFile> =
				(context) => (rootNode) => {
					const visitor: ts.Visitor = (node) => {
						node = ts.visitEachChild(node, visitor, context);

						if (
							this.isHtmlFragment(node) &&
							node.parent &&
							// Only traverse nodes which are children of other JSX nodes
							this.isHtmlFragment(node.parent)
						) {
							const tree = this.toAst(node);

							// Only deal with single elements, not fragments
							if (tree.length === 1) {
								const ast = tree[0];
								if (ast.type === "tag") {
									const nodeType = getNodeType(ast);

									if (nodeType !== NODE_TYPE.IGNORED) {
										placeholders[idx] = prerenderNode({
											node: ast,
											...options,
										});

										const el = createPrerenderTsNode(idx.toString(), context);
										idx += 1;
										return el;
									}
								}
							}
						}

						return node;
					};

					return ts.visitNode(rootNode, visitor);
				};

			const ast = this.parse(code);
			const sourceFile = ast.getSourceFile();

			const result = ts.transform<ts.SourceFile>(sourceFile, [transformer]);
			const transformedSourceFile = result.transformed[0];

			const printer = ts.createPrinter();
			const transformedContent = printer.printFile(transformedSourceFile);
			result.dispose();

			return replacePlaceholders(transformedContent, placeholders);
		},
	};
}
