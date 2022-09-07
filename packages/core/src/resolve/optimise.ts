// @ts-expect-error has no type definitions
import { optimize } from "svgo/dist/svgo.browser";
import type { optimize as OptimiseFn } from "svgo";

const optimiseFn = optimize as typeof OptimiseFn;

export function optimiseRawSvg(contents: string) {
	const data = optimiseFn(contents, {
		plugins: [
			"removeDoctype",
			"removeXMLProcInst",
			"removeComments",
			"removeMetadata",
			"removeXMLNS",
			"removeEditorsNSData",
			"cleanupAttrs",
			"minifyStyles",
			"convertStyleToAttrs",
			"removeRasterImages",
			"removeUselessDefs",
			"cleanupNumericValues",
			"cleanupListOfValues",
			"convertColors",
			"removeUnknownsAndDefaults",
			"removeNonInheritableGroupAttrs",
			"removeUselessStrokeAndFill",
			"removeViewBox",
			"cleanupEnableBackground",
			"removeHiddenElems",
			"removeEmptyText",
			"convertShapeToPath",
			"moveElemsAttrsToGroup",
			"moveGroupAttrsToElems",
			"collapseGroups",
			"convertPathData",
			"convertTransform",
			"removeEmptyAttrs",
			"removeEmptyContainers",
			"mergePaths",
			"removeUnusedNS",
			"sortAttrs",
			"removeTitle",
			"removeDesc",
			"removeDimensions",
			"removeStyleElement",
			"removeScriptElement",
		],
	});

	if ("data" in data) {
		return data.data;
	}

	throw new Error(data.error);
}
