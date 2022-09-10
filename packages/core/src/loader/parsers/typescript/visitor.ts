import ts from "typescript";
import type { AstParser } from "../types";
import { parseAttributes } from "./util";

export type JsxNode = ts.JsxElement | ts.JsxSelfClosingElement | ts.JsxFragment;
export type TsParser = AstParser<ts.Node, JsxNode>;

export function createTsVisitor(
	parser: TsParser,
	root: ts.Node,
	nodes: AstElement[]
) {
	/**
	 * Idea:
	 *
	 * 1. First find the root JSX node
	 * 2. Traverse the immediate children of this node only
	 * 3. Create sub-visitors for each of these immediate children and visit their
	 *    immediate children
	 * 4. Repeat (3) recursively, populating each sub-ast, until no nodes are left
	 *
	 * This approach is used because recursively traversing the root node (using
	 * { recursive: true }) visits nodes more than once, leading to duplicated
	 * elements in the AST
	 */
	return {
		visit() {
			const component = getJsxComponent(root, parser);

			if (!component) {
				return;
			}

			// Visitor to traverse each node
			return parser.traverse(component, (node) => {
				if (ts.isJsxText(node)) {
					nodes.push({
						type: "text",
						content: node.getFullText(),
					});
				} else if (ts.isJsxSelfClosingElement(node)) {
					nodes.push({
						type: "tag",
						name: node.tagName.getText(),
						attrs: parseAttributes(node.attributes),
						children: [],
						voidElement: true,
					});
				} else if (ts.isJsxElement(node)) {
					const { children, openingElement } = node;
					const astChildren: AstElement[] = [];
					for (const child of children) {
						const visitor = createTsVisitor(parser, child, astChildren);
						visitor.visit();
					}

					nodes.push({
						type: "tag",
						name: openingElement.tagName.getText(),
						attrs: parseAttributes(openingElement.attributes),
						children: astChildren,
						voidElement: false,
					});
				}
			});
		},
	};
}

/**
 * Helper function to find the root JSX component in the AST which can
 * either be a component file (with a function that returns a JSX fragment)
 * or simply just an AST containing JSX nodes only
 *
 * @param root
 * @param parser
 * @returns
 */
function getJsxComponent(root: ts.Node, parser: TsParser) {
	let component: JsxNode | undefined;

	// Visitor to find the JSX component
	parser.traverse(
		root,
		(node) => {
			if (!component) {
				let workingNode: ts.Node = node;

				if (ts.isReturnStatement(node)) {
					// Child node at position 0 is the return keyword
					workingNode = node.getChildAt(1);

					// In case the component is wrapped in parentheses
					if (ts.isParenthesizedExpression(workingNode)) {
						// Child node at position 0 is the opening parentheses
						workingNode = workingNode.getChildAt(1);
					}
				}

				if (parser.isHtmlFragment(workingNode)) {
					component = workingNode;
				}
			}
		},
		{ recursive: true }
	);

	return component;
}
