import { PLUGIN_NAME } from "@/types";
import HTML from "html-parse-stringify";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ICON_ATTRIBUTE, NODE_TYPE } from "../filter/filter";
import { fetchSvgFromService } from "./fetch";
import { getIconifyIcon } from "./iconify";
import { optimiseRawSvg } from "./optimise";
import { getUseTagHref, isFilePath, isUrl, removeIdFromPath } from "./util";

async function getRawSVG(
	node: TagAstElement,
	nodeType: Exclude<NODE_TYPE, NODE_TYPE.IGNORED>,
	outDir: string
) {
	const href =
		nodeType === NODE_TYPE.USE_HREF
			? getUseTagHref(node)
			: (node.attrs[ICON_ATTRIBUTE] as string);

	if (isUrl(href)) {
		return fetchSvgFromService(href);
	}

	/**
	 * TODO: Fix - currently only <use> tags work _with_ relative paths during
	 * development because bundler does not copy over static assets if they are
	 * only referenced using a data attribute (rather than a recognised HTML
	 * attribute)
	 *
	 * Perhaps modify plugin to also traverse HTML and copy referenced local
	 * assets to directory?
	 */

	if (isFilePath(href)) {
		// During development
		/* istanbul ignore next */
		if (isUrl(outDir)) {
			return fetchSvgFromService(
				new URL(removeIdFromPath(href), outDir).toString()
			);
		}
		return readFile(path.join(outDir, removeIdFromPath(href)), "utf8");
	}

	const [pack, name] = href.split(":");
	if (pack && name) {
		return getIconifyIcon(pack, name);
	}

	throw nodeType === NODE_TYPE.USE_HREF
		? new Error(
				`[${PLUGIN_NAME}] could not resolve icon from <use> with attributes ${JSON.stringify(
					node.attrs,
					null,
					4
				)}`
		  )
		: new Error(
				`Could not resolve icon from ${node.name} with ${ICON_ATTRIBUTE}="${href}"`
		  );
}

/**
 * Load the raw SVG whether from the output directory, the Iconify API, or some other external URL
 */
export async function loadSvgToNode(...params: Parameters<typeof getRawSVG>) {
	const raw = await getRawSVG(...params);
	const optimised = optimiseRawSvg(raw);
	const [svg] = HTML.parse(optimised) as [TagAstElement];
	svg.attrs[ICON_ATTRIBUTE] = "";
	svg.attrs["data-prerendered"] = "";
	return svg;
}
