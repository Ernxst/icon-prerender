import type { PrerenderOptions } from "@/prerender/util";

export type GenericParser = AstParser<unknown, unknown>;

/**
 * Interface for a parser that parses source code into an AST
 *
 * Used instead of using regex to replace transformed source code as this is
 * much more reliable
 */
export interface AstParser<
	NodeType,
	HtmlNode extends NodeType,
	RootNode = NodeType,
	ParseOptions = undefined
> {
	parse: ParseOptions extends undefined
		? /**
		   * Parse the source code into an AST.
		   * @param code
		   */
		  (code: string) => RootNode
		: /**
		   * Parse the source code into an AST.
		   *
		   * @param code source code to parse
		   * @param options
		   */
		  (code: string, options?: ParseOptions) => RootNode;

	/**
	 * Traverse the AST (recursively optional)
	 *
	 * @param root root node to start that
	 * @param cb callback function to be called for each node
	 * @param options
	 */
	traverse(
		root: NodeType | RootNode,
		cb: (node: RootNode | NodeType) => void,
		options?: TraverseOptions
	): void;

	/**
	 * Returns whether the given node is the JSX part of the source code
	 * @param node
	 */
	isHtmlFragment(node: RootNode | NodeType): node is HtmlNode;

	/**
	 * Build an AST from the source code, traverse it, and prerender any icons
	 * in the AST, returning the transformed code
	 * @param code
	 * @param options
	 */
	prerender(code: string, options: PrerenderOptions): Promise<string>;

	/**
	 * Convert a `node` into the AST required by the prerendering algorithm
	 *
	 * @param node
	 */
	toAst(node: RootNode | NodeType): AstElement[];
}

interface TraverseOptions {
	recursive?: boolean;
}
