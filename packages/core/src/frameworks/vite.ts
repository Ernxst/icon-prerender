import { prerender } from "@/plugin-common";
import type { SvgPrerenderPluginOptions } from "@/types";
import { PLUGIN_NAME } from "@/types";
import type { Plugin } from "vite";

export interface IconPrerenderPluginViteOptions
	extends SvgPrerenderPluginOptions {}

/**
 * Vite plugin to replace icons with the actual SVG element at build time.
 *
 * @param options
 * @returns
 */
export default function icons(
	options?: IconPrerenderPluginViteOptions
): Plugin {
	let outDir: string;

	return {
		name: PLUGIN_NAME,
		configResolved(config) {
			// eslint-disable-next-line prefer-destructuring
			outDir = config.build.outDir;
		},
		async writeBundle() {
			await prerender({
				...options,
				outDir,
			});
		},
	};
}
