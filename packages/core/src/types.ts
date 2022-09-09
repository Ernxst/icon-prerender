export type AttributeFilter =
	| (string | RegExp)[]
	| RegExp
	| ((attribute: string, value: string) => boolean);

export interface IconPrerenderPluginOptions {
	/**
	 * A regex, an array of strings (or regexes) of HTML attributes
	 * (can be custom) to filter elements on
	 *
	 * If an attribute of any HTML element matches anything inside this array,
	 * it will be transformed into an SVG element.
	 *
	 * If this value is not provided, default filtering will be used:
	 *
	 * - Any SVG element wrapping a `<use />` tag with an `href` or `xlink:href`
	 *   attribute.
	 * - One of the following elements _with_ a `data-icon` attribute:
	 *   - `<div>`
	 *   - `<span>`
	 *   - `<figure>`
	 *   - `<img>`
	 *   - `<svg>`
	 *   - any custom element tag
	 *
	 * Note that if you want to filter by attribute value, you must use a custom
	 * function
	 */
	include?: AttributeFilter;
	/**
	 * An array of strings (or regexes) of HTML attributes (can be custom) to
	 * filter elements on
	 *
	 * If an attribute of any HTML element matches anything inside this array,
	 * it will **not** be transformed into an SVG element.
	 *
	 * If this value is not provided, default filtering will be used:
	 *
	 * - Any SVG element wrapping a `<use />` tag with an `href` or `xlink:href`
	 *   attribute.
	 * - One of the following elements _with_ a `data-icon` attribute:
	 *   - `<div>`
	 *   - `<span>`
	 *   - `<figure>`
	 *   - `<img>`
	 *   - `<svg>`
	 *   - any custom element tag
	 *
	 * Note that if you want to filter by attribute value, you must use a custom
	 * function
	 */
	exclude?: AttributeFilter;
}

export { name as PLUGIN_NAME } from "@/../package.json";
