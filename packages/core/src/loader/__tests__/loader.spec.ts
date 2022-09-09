import path from "node:path";
import glob from "fast-glob";
import { describe, expect, test } from "vitest";
import { createDirectoryHandler } from "~/lib/directory-handler";
import { MOCK_RESPONSE } from "~/mocks/constants";
import { fetchMock } from "~/mocks/fetch";
import { useLoader } from "../loader";

const MOCK_SRC_DIR = path.join("test", "mock-src");
let componentFiles: string[];

describe("Component loader", async () => {
	componentFiles = await glob(path.join(MOCK_SRC_DIR, "components", "*"));

	for (const file of componentFiles) {
		const { ext } = path.parse(file);
		const handler = createDirectoryHandler(MOCK_SRC_DIR);

		test(`Should prerender icons in ${ext} files`, async () => {
			await handler.mkdir();
			fetchMock.mockImplementation(() =>
				Promise.resolve(MOCK_RESPONSE.clone())
			);

			const result = await useLoader(file, {
				outDir: MOCK_SRC_DIR,
			});

			expect(result).not.toBe(null);
			expect(result?.code).toContain("data-prerendered");

			await handler.rmdir();
			fetchMock.mockClear();
		});
	}

	test("Should ignore non-component files", async () => {
		const result = await useLoader(
			path.join(MOCK_SRC_DIR, "assets", "astro.svg"),
			{
				outDir: MOCK_SRC_DIR,
			}
		);
		expect(result).toBe(null);
	});
});
