import { prerender } from "@/plugin-common";
import type { SvgPrerenderPluginOptions } from "@/types";
import { PLUGIN_NAME } from "@/types";
import type { AstroIntegration } from "astro";

export interface AstroPluginIconsOptions extends SvgPrerenderPluginOptions {}

/**
 * Astro integration to replace icons with the actual SVG element at build time.
 */
export default function icons(
	options?: AstroPluginIconsOptions
): AstroIntegration {
	return {
		name: PLUGIN_NAME,
		hooks: {
			"astro:build:done": async ({ dir }) => {
				const outDir = dir.pathname;
				await prerender({ ...options, outDir });
			},
		},
	};
}
