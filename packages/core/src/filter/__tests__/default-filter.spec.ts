import {
	getNodeType,
	ICON_ATTRIBUTE,
	ICON_NODE_NAMES,
	NODE_TYPE,
} from "@/filter/filter";
import { describe, expect, test } from "vitest";
import { createAstTag } from "~/lib/ast";

const ASSET = "assets/astro.svg#id";

describe.concurrent("Default node filtering", () => {
	for (const tagName of ICON_NODE_NAMES) {
		test(`Should return ${NODE_TYPE.DATA_ATTRIBUTE} for a <${tagName} /> element with a "${ICON_ATTRIBUTE}" attribute`, () => {
			const node = createAstTag({
				name: tagName,
				attrs: {
					[ICON_ATTRIBUTE]: "mdi:chevron-right",
				},
			});

			const nodeType = getNodeType(node);
			expect(nodeType).toEqual(NODE_TYPE.DATA_ATTRIBUTE);
		});
	}

	for (const tagName of ICON_NODE_NAMES) {
		test(`Should return ${NODE_TYPE.IGNORED} for a <${tagName} /> element without a "${ICON_ATTRIBUTE}" attribute`, () => {
			const node = createAstTag({
				name: tagName,
			});

			const nodeType = getNodeType(node);
			expect(nodeType).toEqual(NODE_TYPE.IGNORED);
		});
	}

	test(`Should return ${NODE_TYPE.DATA_ATTRIBUTE} for a custom HTML element with a "${ICON_ATTRIBUTE}" attribute`, () => {
		const node = createAstTag({
			name: "my-element",
			attrs: {
				[ICON_ATTRIBUTE]: "mdi:chevron-double-down",
			},
		});

		const nodeType = getNodeType(node);
		expect(nodeType).toEqual(NODE_TYPE.DATA_ATTRIBUTE);
	});

	test(`Should return ${NODE_TYPE.USE_HREF} for a <svg> wrapped around a <use href=...> tag`, () => {
		const node = createAstTag({
			name: "svg",
			children: [
				createAstTag({
					name: "use",
					attrs: {
						href: ASSET,
					},
				}),
			],
		});

		const nodeType = getNodeType(node);
		expect(nodeType).toEqual(NODE_TYPE.USE_HREF);
	});

	test(`Should return ${NODE_TYPE.USE_HREF} for an <svg> wrapped around a <use xlink:href=...> tag`, () => {
		const node = createAstTag({
			name: "svg",
			children: [
				createAstTag({
					name: "use",
					attrs: {
						"xlink:href": ASSET,
					},
				}),
			],
		});

		const nodeType = getNodeType(node);
		expect(nodeType).toEqual(NODE_TYPE.USE_HREF);
	});

	test(`Should return ${NODE_TYPE.USE_HREF} for an <svg> without <use> tag or "${ICON_ATTRIBUTE}" attribute`, () => {
		const node = createAstTag({
			name: "svg",
		});

		const nodeType = getNodeType(node);
		expect(nodeType).toEqual(NODE_TYPE.IGNORED);
	});

	test(`Should return ${NODE_TYPE.IGNORED} for a <svg> wrapped around a <use> tag (without an href or xlink:href)`, () => {
		const node = createAstTag({
			name: "svg",
			children: [
				createAstTag({
					name: "use",
				}),
			],
		});

		const nodeType = getNodeType(node);
		expect(nodeType).toEqual(NODE_TYPE.IGNORED);
	});

	test(`Should return ${NODE_TYPE.IGNORED} for a <h1> element`, () => {
		const node = createAstTag({
			name: "h1",
		});

		const nodeType = getNodeType(node);
		expect(nodeType).toEqual(NODE_TYPE.IGNORED);
	});

	test(`Should return ${NODE_TYPE.IGNORED} for a <h1> element even with a "${ICON_ATTRIBUTE}" attribute`, () => {
		const node = createAstTag({
			name: "h1",
			attrs: {
				[ICON_ATTRIBUTE]: ASSET,
			},
		});

		const nodeType = getNodeType(node);
		expect(nodeType).toEqual(NODE_TYPE.IGNORED);
	});
});
