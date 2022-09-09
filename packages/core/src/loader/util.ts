import { createFilter } from "vite";

/**
 * Returns whether the file path is (likely to be) a component file that we
 * should transform
 */
export const isComponentFile = createFilter([
	"**/*.{js,ts,cjs,mjs,cts,mts,jsx,tsx,html,pug,ejs,svelte,svx,md,mdx,vue}",
]);

// TODO: Add unit tests
/**
 * Build a regex which includes whitespace
 *
 * This is needed because `html-parse-stringify` is not guaranteed to
 * stringify an AST node back into what it was originally.
 *
 * So, we build quite a complex regex handling the discrepancy.
 *
 *
 * @param str
 * @returns
 */
export function buildWhitespacedRegex(str: string) {
	/**
	 * You can log `regex` and paste it and the source code into a regex tool
	 * like Regexr and a match should be found.
	 *
	 * If a match is not found, copy the element and the produced regex and
	 * include it in a new raised issue at https://github.com/Ernxst/icon-prerender/issues
	 *
	 * Unfortunately, I cannot write enough unit tests myself to ensure it works
	 *
	 * Hopefully, the regex does not alter the source code (apart from inlining
	 * the icon). If it does, raise an issue as above.
	 */
	const regex = stripControlCharacters(str)
		.trim()
		.split(" ")
		.map((s) => s.trim())
		// Allow whitespace between segments
		.join("\\s*")
		// Allow whitespace before and after
		.replaceAll(">", "\\s*>\\s*")
		.replaceAll("<", "\\s*<\\s*")
		// Allow whitespace between fragments
		.replaceAll("><", ">\\s*<")
		.replaceAll("(<)?/(>)?", "\\s*$1\\/\\s*$2\\s*")
		// Handle boolean attributes
		.replaceAll(/(\s*?[A-Za-z-]+?)=""/g, `$1(\\s*=\\s*"")?`)
		// Allow whitespace between data attributes
		.replaceAll(/(\s*?[A-Za-z-]+?)="/g, `$1\\s*=\\s*"`)
		// Replace first occurrence at start of string
		.replace("\\s*<", "<");

	return new RegExp(regex);
}

export function stripControlCharacters(str: string) {
	// eslint-disable-next-line no-control-regex
	return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
}
