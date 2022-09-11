import { typescriptParser } from "../typescript";
import type { TsParser } from "../typescript/visitor";

/**
 * Uses the TypeScript parser under the hood but strips the Astro frontmatter
 * and adds it back on after parsing
 * @returns
 */
export function astroParser(): TsParser {
	const parser = typescriptParser();
	return {
		...parser,
		async prerender(code, options) {
			// Remove frontmatter and prepend it once we're done
			const frontmatterRegex = /^\s*---(.|\s)*?---/;
			const frontmatterMatches = code.match(frontmatterRegex);
			const frontmatter = frontmatterMatches?.at(0) ?? "";

			/**
			 * TS parser cannot handle DOCTYPE tag so we store it and add a placeholder
			 * that we will replace after
			 */
			const docTypeRegex = /<\s*!\s*(DOCTYPE|doctype)\s*html>/g;
			const docType = code.match(docTypeRegex)?.at(0) ?? "";

			const template = code
				.replace(frontmatterRegex, "")
				// Replace all in case, for some reason, page has multiple doc types
				.replaceAll(docTypeRegex, "{/* __DOCTYPE__ */}");

			/**
			 * Wrap the Astro JSX fragment in wrapper code so TypeScript will
			 * parse it properly
			 */
			const templateAsJsx = `export default Component = () => (\n<>\n${template}\n</>\n);`;
			const prerendered = await parser.prerender(templateAsJsx, options);
			
			// Add the doc type back
			const docTypeAdded = prerendered.replaceAll(
				/{\s*\/\*\s*__DOCTYPE__\s*\*\/\s*}/g,
				docType
			);
			/**
			 * The following regex:
			 *
			 * /export default Component\s*=\s*\(\s*\)\s*=>\s*\(\s*<>\s*(.|\s)*\s*<\/>\s*\);?^/
			 *
			 * Is too slow, so we split it into two parts to remove the wrapper code
			 */
			const wrapperRemoved = docTypeAdded
				.replace(/export default Component\s*=\s*\(\s*\)\s*=>\s*\(\s*<>\s*/, "")
				.replace(/\s*<\/>\s*\);?\s*$/gm, "");

			return `${frontmatter}\n\n${wrapperRemoved}`;
		},
	};
}
