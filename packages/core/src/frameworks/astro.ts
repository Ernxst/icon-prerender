/* eslint-disable prefer-rest-params */
import type { IconPrerenderPluginOptions } from "@/types";
import { PLUGIN_NAME } from "@/types";
import type { AstroIntegration } from "astro";
import vite from "./vite";

// TODO: Small bug: requires an initial reload on server startup (no cache) to show full page

export interface AstroIconPrerenderIntegrationOptions
	extends IconPrerenderPluginOptions {}

/**
 * Astro integration to replace icons with the actual SVG element at build time.
 */
export default function icons(
	options?: AstroIconPrerenderIntegrationOptions
): AstroIntegration {
	return {
		name: PLUGIN_NAME,
		hooks: {
			"astro:config:setup": ({ updateConfig }) => {
				updateConfig({ vite: { plugins: [vite(options)] } });
			},
		},
	};
}
