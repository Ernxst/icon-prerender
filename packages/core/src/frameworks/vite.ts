import type { IconPrerenderPluginOptions } from "@/types";
import { PLUGIN_NAME } from "@/types";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { useLoader } from "../loader/loader";

export interface IconPrerenderPluginViteOptions
	extends IconPrerenderPluginOptions {}

/**
 * Vite plugin to replace icons with the actual SVG element at build time.
 *
 * @param options
 * @returns
 */
export default function icons(
	options?: IconPrerenderPluginViteOptions
): Plugin {
	let vite: ViteDevServer;
	let userConfig: ResolvedConfig;

	return {
		name: PLUGIN_NAME,
		configResolved(config) {
			userConfig = config;
		},
		configureServer(server) {
			vite = server;
		},
		load(id) {
			const outDir =
				userConfig.command === "serve"
					? vite.resolvedUrls?.local[0] ?? ""
					: userConfig.build.outDir;
			return useLoader(id, { outDir, ...options });
		},
	};
}
