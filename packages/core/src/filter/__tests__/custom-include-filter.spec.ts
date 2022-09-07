import type { AttributeFilter } from "@/types";
import { describe, expect, test } from "vitest";
import { createAstTag } from "~/lib/ast";
import { getNodeType, NODE_TYPE } from "../filter";

interface TestFilterOptions {
	filterType: "string[]" | "(string|RegExp)[]" | "RegExp" | "function";
	filter: AttributeFilter;
	attributes: Record<string, string>;
}

function testIncludeFilter(options: TestFilterOptions) {
	const { filter, filterType, attributes } = options;

	test(`Should return ${NODE_TYPE.DATA_ATTRIBUTE} for an element matching a custom include filter ${filterType}`, () => {
		const node = createAstTag({
			name: "h1",
			attrs: attributes,
		});

		const nodeType = getNodeType(node, { include: filter });
		expect(nodeType).toEqual(NODE_TYPE.DATA_ATTRIBUTE);
	});

	test(`Should return ${NODE_TYPE.IGNORED} for an element not matching a custom include filter ${filterType}`, () => {
		const node = createAstTag({
			name: "h1",
		});

		const nodeType = getNodeType(node, { include: filter });
		expect(nodeType).toEqual(NODE_TYPE.IGNORED);
	});
}

describe.concurrent("Custom node filtering (include)", () => {
	const attribute = "data-test";

	testIncludeFilter({
		attributes: { [attribute]: "some-value" },
		filter: [attribute],
		filterType: "string[]",
	});

	// // (string|RegExp)[]
	testIncludeFilter({
		attributes: { [attribute]: "some-different-value", prerender: "true" },
		filter: [attribute, /prerender/],
		filterType: "(string|RegExp)[]",
	});

	// RegExp
	testIncludeFilter({
		attributes: {
			"regexp-should-accept-this": "some-other-value",
			"regexp-should-reject-this": "value",
		},
		filter: /regexp-should-accept-.*/,
		filterType: "RegExp",
	});

	// Custom function
	testIncludeFilter({
		attributes: {
			"data-attribute": "some-final-value",
			"filter-fn-should-reject-this": "value",
		},
		filter: (_attr, val) => val === "some-final-value",
		filterType: "function",
	});
});
