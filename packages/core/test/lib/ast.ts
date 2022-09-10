/**
 * Helper function with TypeScript intellisense
 * @param ast
 * @returns
 */
export function createAstTag(
	ast: Partial<Omit<TagAstElement, "type" | "name">> & { name: string }
): TagAstElement {
	return {
		children: [],
		type: "tag",
		attrs: {},
		voidElement: false,
		...ast,
	};
}
