import HTML from "html-parse-stringify";
import { createAstTag } from "~/lib/ast";

export const MOCK_SVG = HTML.stringify([
	createAstTag({
		name: "svg",
		attrs: {
			xmlns: "http://www.w3.org/2000/svg",
			"xmlns:xlink": "http://www.w3.org/1999/xlink",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
			class: "feather feather-icon",
		},
		children: [
			createAstTag({
				name: "path",
			}),
		],
	}),
]);

export const MOCK_RESPONSE = new Response(MOCK_SVG, {
	headers: {
		"content-type": "svg",
	},
});
