import type { IconPrerenderPluginOptions } from "@/types";
import { PLUGIN_NAME } from "@/types";
import type { NormalizedOutputOptions, Plugin } from "rollup";
import { useLoader } from "../loader/loader";

export interface IconPrerenderPluginRollupOptions
	extends IconPrerenderPluginOptions {}

/**
 * Rollup plugin to replace icons with the actual SVG element at build time.
 *
 * @param options
 * @returns
 */
export default function icons(
	options?: IconPrerenderPluginRollupOptions
): Plugin {
	let outputOptions: NormalizedOutputOptions;

	return {
		name: PLUGIN_NAME,
		renderStart(opts) {
			outputOptions = opts;
		},
		load(id) {
			const outDir = outputOptions.dir ?? "dist";
			return useLoader(id, { outDir, ...options });
		},
	};
}
