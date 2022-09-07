import { ICON_ATTRIBUTE, NODE_TYPE } from "@/filter/filter";
import { describe, expect, test } from "vitest";
import { createAstTag } from "~/lib/ast";
import { loadSvg } from "../load";
import path from "node:path";
import { fetchMock } from "~/mocks/fetch";
import { MOCK_RESPONSE } from "~/mocks/constants";

const outDir = path.join(process.cwd(), "test", "mock-dist");

describe.concurrent("Load SVG", () => {
	test("Should load an icon from Iconify", async () => {
		const node = createAstTag({
			name: "span",
			attrs: {
				[ICON_ATTRIBUTE]: "mdi:check",
			},
		});

		const svg = await loadSvg(node, NODE_TYPE.DATA_ATTRIBUTE, outDir);
		expect(svg.children.length).toBeGreaterThan(0);
		/**
		 * See line 66 of src/resolve/load.ts to see why we expect
		 * attrs[ICON_ATTRIBUTE] to be the empty string when we set it to
		 * "mdi:check" above
		 */
		expect(svg.attrs[ICON_ATTRIBUTE]).toEqual("");
	});

	test("Should load an icon <use> tag", async () => {
		const node = createAstTag({
			name: "svg",
			children: [
				createAstTag({
					name: "use",
					attrs: {
						href: "mdi:chevron-right",
					},
				}),
			],
		});

		const svg = await loadSvg(node, NODE_TYPE.USE_HREF, outDir);

		expect(svg.children.length).toBeGreaterThan(0);
		expect(svg.attrs[ICON_ATTRIBUTE]).toEqual("");
	});

	test("Should load an icon from a file path", async () => {
		const node = createAstTag({
			name: "svg",
			children: [
				createAstTag({
					name: "use",
					attrs: {
						href: "/assets/astro.svg",
					},
				}),
			],
		});

		const svg = await loadSvg(node, NODE_TYPE.USE_HREF, outDir);

		expect(svg.children.length).toBeGreaterThan(0);
		expect(svg.attrs[ICON_ATTRIBUTE]).toEqual("");
	});

	test("Should load an icon from a file path with an ID on the end", async () => {
		const node = createAstTag({
			name: "svg",
			children: [
				createAstTag({
					name: "use",
					attrs: {
						href: "/assets/astro.svg#id",
					},
				}),
			],
		});

		const svg = await loadSvg(node, NODE_TYPE.USE_HREF, outDir);

		expect(svg.children.length).toBeGreaterThan(0);
		expect(svg.attrs[ICON_ATTRIBUTE]).toEqual("");
	});

	test("Should load an icon from an API", async () => {
		fetchMock.mockResolvedValueOnce(MOCK_RESPONSE);

		const node = createAstTag({
			name: "span",
			attrs: {
				[ICON_ATTRIBUTE]: "https://some-icon-api.com",
			},
		});

		const svg = await loadSvg(node, NODE_TYPE.DATA_ATTRIBUTE, outDir);
		expect(svg.name).toEqual("svg");
	});

	test(`Should throw an error for an invalid ${ICON_ATTRIBUTE} attribute`, async () => {
		const node = createAstTag({
			name: "span",
			attrs: {
				[ICON_ATTRIBUTE]: "unknown",
			},
		});

		await expect(() =>
			loadSvg(node, NODE_TYPE.DATA_ATTRIBUTE, outDir)
		).rejects.toThrowError();
	});

	test(`Should throw an error for an invalid ${ICON_ATTRIBUTE} attribute`, async () => {
		const node = createAstTag({
			name: "svg",
			children: [
				createAstTag({
					name: "use",
					attrs: {
						href: "unknown",
					},
				}),
			],
		});

		await expect(() =>
			loadSvg(node, NODE_TYPE.USE_HREF, outDir)
		).rejects.toThrowError();
	});
});
