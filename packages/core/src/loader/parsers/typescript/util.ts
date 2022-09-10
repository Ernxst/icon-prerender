import ts from "typescript";

const PLACEHOLDER_TAG = "placeholder";
const ID_FIELD = "id";

export function createPrerenderTsNode(
	id: string,
	context: ts.TransformationContext
) {
	return context.factory.createJsxSelfClosingElement(
		context.factory.createIdentifier(PLACEHOLDER_TAG),
		[],
		context.factory.createJsxAttributes([
			context.factory.createJsxAttribute(
				context.factory.createIdentifier(ID_FIELD),
				context.factory.createStringLiteral(id)
			),
		])
	);
}

export function parseAttributes(attributes: ts.JsxAttributes) {
	const attrs: Record<string, string> = {};

	attributes.forEachChild((s) => {
		if (ts.isJsxAttribute(s)) {
			const { name, initializer } = s;
			if (!initializer) {
				attrs[name.escapedText.toString()] = "";
			} else if (ts.isStringLiteral(initializer)) {
				attrs[name.escapedText.toString()] = initializer.text;
			}
		}
	});

	return attrs;
}

export async function replacePlaceholders(
	code: string,
	placeholders: Record<string, Promise<string>>
): Promise<string> {
	for (const [id, htmlPromise] of Object.entries(placeholders)) {
		const html = await htmlPromise;
		// Try with and without a space before the self closing tag
		code = code.replace(`<${PLACEHOLDER_TAG} ${ID_FIELD}="${id}"/>`, html);
		code = code.replace(`<${PLACEHOLDER_TAG} ${ID_FIELD}="${id}" />`, html);
	}
	return code;
}
