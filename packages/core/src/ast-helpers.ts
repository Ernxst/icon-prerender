interface Options {
	/**
	 * Optional extra filter to apply
	 */
	filter?: (node: AstElement) => boolean;
	recursive?: boolean;
}
/**
 * Retrieve an array of `TagAstElement` nodes from an `ast` by its `name` property.
 * @param tagName tag to search for
 * @param ast the AST to search
 * @param options
 * @returns the `TagAstElement` node
 */
export function findTags(
	tagName: string,
	ast: AstElement,
	options?: Options
): TagAstElement[] {
	const { recursive = false, filter } = options ?? {};

	if (ast.type === "tag") {
		const items = ast.children
			.filter((t) => t.type === "tag" && t.name === tagName)
			.filter((s) => (filter ? filter(s as TagAstElement) : true));

		// eslint-disable-next-line unicorn/prefer-spread
		return (items as TagAstElement[]).concat(
			recursive
				? ast.children.flatMap((node) => {
						if (node.type === "tag") {
							return findTags(tagName, node, options);
						}
						return [];
				  })
				: []
		);
	}
	/* istanbul ignore next */
	throw new Error(`This ast is not a tag element`);
}
