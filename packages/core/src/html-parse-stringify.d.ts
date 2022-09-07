interface TextAstElement {
	type: "text";
	content: string;
}

interface CommentAstElement {
	type: "comment";
	comment: string;
}

interface TagAstElement {
	type: "tag";
	name: string;
	attrs: Record<string, unknown>;
	voidElement: boolean;
	children: AstElement[];
}

interface ComponentAstElement extends Omit<TagAstElement, "type" | "children"> {
	type: "component";
	children: [];
}

type AstElement = TextAstElement | TagAstElement | ComponentAstElement;

declare module "html-parse-stringify" {
	const module: {
		parse(htmlString: string, options?: any): AstElement[];
		stringify(AST: AstElement[]): string;
	};

	export default module;
}
