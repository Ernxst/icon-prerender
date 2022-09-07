import type { SetOptional } from "type-fest";

/**
 * Helper function with TypeScript intellisense
 * @param ast
 * @returns
 */
export function createAstTag(
	ast: SetOptional<
		Omit<TagAstElement, "type">,
		"children" | "attrs" | "voidElement"
	>
): TagAstElement {
	return {
		children: [],
		type: "tag",
		attrs: {},
		voidElement: false,
		...ast,
	};
}
