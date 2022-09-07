/**
 * Retrieve an array of `TagAstElement` nodes from an `ast` by its `name` property.
 * @param tagName tag to search for
 * @param ast the AST to search
 * @param filter optional extra filter to apply
 * @returns the `TagAstElement` node
 */
export function findTags(
	tagName: string,
	ast: AstElement,
	filter?: (node: TagAstElement) => boolean
) {
	if (ast.type === "tag") {
		const items = ast.children
			.filter((t) => t.type === "tag" && t.name === tagName)
			.filter((s) => (filter ? filter(s as TagAstElement) : true));
		return items as TagAstElement[];
	}
	/* istanbul ignore next */
	throw new Error(`This ast is not a tag element`);
}
