import { prerender } from "@/plugin-common";
import type { SvgPrerenderPluginOptions } from "@/types";
import { PLUGIN_NAME } from "@/types";
import type { Plugin } from "rollup";

export interface IconPrerenderPluginRollupOptions
	extends SvgPrerenderPluginOptions {}

/**
 * Rollup plugin to replace icons with the actual SVG element at build time.
 *
 * @param options
 * @returns
 */
export default function icons(
	options?: IconPrerenderPluginRollupOptions
): Plugin {
	return {
		name: PLUGIN_NAME,
		async writeBundle(config) {
			await prerender({
				...options,
				outDir: config.dir ?? "dist",
			});
		},
	};
}
