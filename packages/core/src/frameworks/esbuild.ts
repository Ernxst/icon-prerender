import { prerender } from "@/plugin-common";
import type { Plugin } from "esbuild";
import type { SvgPrerenderPluginOptions } from "../types";
import { PLUGIN_NAME } from "../types";

export interface IconPrerenderPluginESBuildOptions
	extends SvgPrerenderPluginOptions {}

/**
 * ESBuild plugin to replace icons with the actual SVG element at build time.
 *
 * @param options
 * @returns
 */
export default function icons(
	options?: IconPrerenderPluginESBuildOptions
): Plugin {
	return {
		name: PLUGIN_NAME,
		setup({ onEnd, initialOptions }) {
			onEnd(async () => {
				await prerender({
					...options,
					outDir: initialOptions.outdir ?? "dist",
				});
			});
		},
	};
}
