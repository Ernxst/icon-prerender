import { PLUGIN_NAME } from "@/types";
import path from "node:path";
import HTML from "html-parse-stringify";
import { findTags } from "@/ast-helpers";

export function isUrl(value: string) {
	let url;

	try {
		url = new URL(value);
	} catch {
		return false;
	}

	const isHttpProtocol = url.protocol === "http:" || url.protocol === "https:";
	return isHttpProtocol && url.origin !== null;
}

// https://stackoverflow.com/questions/1976007/what-characters-are-forbidden-in-windows-and-linux-directory-names
// Use Windows which is the superset of illegal characters of Mac and Linux
const ILLEGAL_CHARACTERS_WINDOWS = [
	"<",
	">",
	":",
	'"',
	"/",
	"\\",
	"|",
	"?",
	"*",
];

export function isFilePath(value: string) {
	const rawPath = removeIdFromPath(value);
	const split = rawPath.split(path.sep);
	if (
		split.some((segment) =>
			ILLEGAL_CHARACTERS_WINDOWS.some((char) => segment.includes(char))
		)
	) {
		return false;
	}

	return /^[\w !#$%&+./=@[\\\]^{}-]+\.[\dA-Za-z]+$/.test(rawPath);
}

export function removeIdFromPath(rawPath: string) {
	/**
	 * In case href has an id on the end e.g., icon.svg#id
	 */
	const idx = rawPath.indexOf("#");
	return rawPath.includes("#") ? rawPath.slice(0, idx) : rawPath;
}

/**
 * Get the `href` or `xlink:href` from a `<use>` wrapped inside an `<svg>`
 * @param node
 */
export function getUseTagHref(node: TagAstElement) {
	const [useTag] = findTags("use", node);
	const rawPath = (useTag.attrs.href ?? useTag.attrs["xlink:href"]) as
		| string
		| undefined;

	if (!rawPath) {
		throw new Error(`[${PLUGIN_NAME}] <use> element is missing either an "href" or "xlink:href" attribute. Search your files for the following element:
${HTML.stringify([node])}`);
	}

	return rawPath;
}
