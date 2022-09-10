import { createFilter } from "vite";

/**
 * Returns whether the file path is (likely to be) a component file that we
 * should transform
 */
export const isComponentFile = createFilter([
	"**/*.{js,ts,jsx,tsx,html,svelte,svx,md,mdx,vue}",
]);

export function stripControlCharacters(str: string) {
	// eslint-disable-next-line no-control-regex
	return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
}
