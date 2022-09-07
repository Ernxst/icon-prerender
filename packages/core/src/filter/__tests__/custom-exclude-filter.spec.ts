import type { AttributeFilter } from "@/types";
import { describe, expect, test } from "vitest";
import { createAstTag } from "~/lib/ast";
import { getNodeType, ICON_ATTRIBUTE, NODE_TYPE } from "../filter";

interface TestFilterOptions {
	filterType: "string[]" | "(string|RegExp)[]" | "RegExp" | "function";
	filter: AttributeFilter;
	attributes: Record<string, string>;
}

function testExcludeFilter(options: TestFilterOptions) {
	const { filter, filterType, attributes } = options;

	test(`Should return ${NODE_TYPE.IGNORED} for an element matching a custom exclude filter ${filterType}`, () => {
		const node = createAstTag({
			name: "h1",
			attrs: attributes,
		});

		const nodeType = getNodeType(node, { exclude: filter });
		expect(nodeType).toEqual(NODE_TYPE.IGNORED);
	});

	test(`Should return ${NODE_TYPE.DATA_ATTRIBUTE} for an element not matching a custom exclude filter ${filterType}`, () => {
		const node = createAstTag({
			name: "svg",
			attrs: {
				[ICON_ATTRIBUTE]: "feather:edit",
			},
		});

		const nodeType = getNodeType(node, { exclude: filter });
		expect(nodeType).toEqual(NODE_TYPE.DATA_ATTRIBUTE);
	});
}

describe.concurrent("Custom node filtering (exclude)", () => {
	const attribute = "data-test";

	testExcludeFilter({
		attributes: { [attribute]: "some-value" },
		filter: [attribute],
		filterType: "string[]",
	});

	// (string|RegExp)[]
	testExcludeFilter({
		attributes: { [attribute]: "some-different-value", prerender: "true" },
		filter: [attribute, /prerender/],
		filterType: "(string|RegExp)[]",
	});

	// RegExp
	testExcludeFilter({
		attributes: {
			"regexp-should-accept-this": "some-other-value",
			"regexp-should-reject-this": "value",
		},
		filter: /regexp-should-accept-.*/,
		filterType: "RegExp",
	});

	// Custom function
	testExcludeFilter({
		attributes: {
			"data-attribute": "some-final-value",
			"filter-fn-should-reject-this": "value",
		},
		filter: (_attr, val) => val === "some-final-value",
		filterType: "function",
	});
});
