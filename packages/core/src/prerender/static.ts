import glob from "fast-glob";
import HTML from "html-parse-stringify";
import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { findTags } from "../ast-helpers";
import type { PrerenderOptions } from "./util";
import { traverse } from "./util";

interface PrerenderBuildOptions extends PrerenderOptions {}

/**
 * Prerendering for static builds - operates on entire HTML files.
 *
 * It globs the output directory for `.html` files and will rewrite their
 * contents if icons were prerendered
 *
 * @param options
 */
export async function prerenderStatic(options: PrerenderBuildOptions) {
	const { outDir } = options;
	const htmlFiles = await glob(path.join(outDir, "**", "*.html"));

	await Promise.all(
		htmlFiles.map(async (file) => {
			const content = await readFile(file, "utf8");

			const [doctype] = HTML.parse(content);
			const [htmlTag] = findTags("html", doctype);
			const [body] = findTags("body", htmlTag);

			const replaced = await traverse(body, options);

			// Avoids unnecessary file writes
			if (replaced) {
				/**
				 * Can't use the `doctype` AST node since it contains { attrs: { html: '' } }
				 * which is stringified into <!DOCTYPE html=""> (instead of
				 * <!DOCTYPE html>) which is invalid HTML.
				 */
				const replacedContent = `<!DOCTYPE html>\n${HTML.stringify([htmlTag])}`;
				await fs.promises.writeFile(file, replacedContent);
			}
		})
	);
}
