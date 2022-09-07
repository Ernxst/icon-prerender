import { describe, expect, test } from "vitest";
import { createAstTag } from "~/lib/ast";
import { getUseTagHref } from "../util";

function createUseTag(filePath: string, hrefAttr?: "href" | "xlink:href") {
	return createAstTag({
		name: "svg",
		children: [
			createAstTag({
				name: "use",
				attrs: hrefAttr
					? {
							[hrefAttr]: filePath,
					  }
					: {},
			}),
		],
	});
}

describe.concurrent("Get href from <use> tag", () => {
	test("Should return the correct href", () => {
		const file = "assets/icon.svg";
		const tag = createUseTag(file, "href");
		expect(getUseTagHref(tag)).toEqual(file);
	});

	test("Should return the correct xlink:href", () => {
		const file = "assets/icon.svg";
		const tag = createUseTag(file, "xlink:href");
		expect(getUseTagHref(tag)).toEqual(file);
	});

	test("Should throw an error if neither href or xlink:href is present", () => {
		const tag = createUseTag("");
		expect(() => getUseTagHref(tag)).toThrowError();
	});
});
