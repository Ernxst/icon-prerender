import type { Plugin } from "esbuild";
import type { IconPrerenderPluginOptions } from "../types";
import { PLUGIN_NAME } from "../types";
import { useLoader } from "../loader/loader";

export interface IconPrerenderPluginESBuildOptions
	extends IconPrerenderPluginOptions {}

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
		setup({ onLoad, initialOptions }) {
			onLoad({ filter: /.*/ }, async (args) => {
				const result = await useLoader(args.path, {
					outDir: initialOptions.outdir ?? "dist",
					...options,
				});

				if (result) {
					return {
						contents: "code",
					};
				}

				return null;
			});
		},
	};
}
