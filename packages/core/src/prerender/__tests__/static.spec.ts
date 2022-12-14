import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test, vi } from "vitest";
import { createDirectoryHandler } from "~/lib/directory-handler";
import { MOCK_RESPONSE } from "~/mocks/constants";
import { fetchMock } from "~/mocks/fetch";
import { prerenderStatic } from "../static";

function readHtmlFile(file: string, outDir: string) {
	return readFile(path.join(outDir, file), "utf8");
}

// include/exclude filtering tested elsewhere
describe.concurrent("Plugin test", () => {
	test("Should not write to a file if the contents were not changed", async () => {
		const handler = createDirectoryHandler("test/mock-dist");
		await handler.mkdir();

		fetchMock.mockImplementation(() => Promise.resolve(MOCK_RESPONSE.clone()));

		const fsSpy = vi.spyOn(fs.promises, "writeFile");
		const outDir = handler.dirName;

		const unchangedHtmlBefore = await readHtmlFile("unchanged.html", outDir);
		// eslint-disable-next-line sonarjs/no-duplicate-string
		const indexHtmlBefore = await readHtmlFile("index.html", outDir);

		await prerenderStatic({ outDir });

		const unchangedHtmlAfter = await readHtmlFile("unchanged.html", outDir);
		const indexHtmlAfter = await readHtmlFile("index.html", outDir);

		expect(fsSpy).toHaveBeenCalledOnce();
		expect(fsSpy).toHaveBeenCalledWith(
			path.join(outDir, "index.html"),
			indexHtmlAfter
		);
		expect(unchangedHtmlAfter).toEqual(unchangedHtmlBefore);
		expect(indexHtmlAfter).not.toEqual(indexHtmlBefore);

		await handler.rmdir();
		fetchMock.mockClear();
	});
});
