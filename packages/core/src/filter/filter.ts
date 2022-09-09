import { HTML_ELEMENTS } from "@/html-elements";
import { isRegExp } from "node:util/types";
import { findTags } from "../ast-helpers";
import type { AttributeFilter, IconPrerenderPluginOptions } from "../types";

// eslint-disable-next-line no-shadow
export enum NODE_TYPE {
	/**
	 * An element which will not be transformed
	 */
	IGNORED = 0,
	/**
	 * An element with a `data-icon` attribute and is one of the recognised elements
	 */
	DATA_ATTRIBUTE = 1,
	/**
	 * an `<svg>` element wrapped around a `<use>` tag which has a
	 * `href` or `xlink:href` attribute will also be transformed
	 */
	USE_HREF = 2,
}

export const ICON_NODE_NAMES = new Set(["div", "span", "figure", "img", "svg"]);
export const ICON_ATTRIBUTE = "data-icon";

/**
 * Return whether the given node should be resolved into an SVG
 *
 * /**
 *  By default, any element that is either a:
 *
 *  - `<div>`
 *  - `<span>`
 *  - `<figure>`
 *  - `<img>`
 *  - `<svg>`
 *  - any custom element tag
 *
 * _and_ has a `data-icon` attribute will be transformed into an SVG.
 *
 * Additionally, any `<svg>` element wrapped around a `<use>` tag which has a
 * `href` or `xlink:href` attribute will also be transformed
 *
 * Note: Even if you use a custom filter function, you must still include the
 * `data-icon=` attribute. The custom filter function is to just include or
 * exclude certain elements from being transformed
 *
 * @param node
 */
export function getNodeType(
	node: TagAstElement,
	options?: IconPrerenderPluginOptions
) {
	const { include, exclude } = options ?? {};
	let isIncluded = false;
	let isExcluded = false;

	if (include) {
		const shouldInclude = getAttributeFilter(include);
		isIncluded = Object.entries(node.attrs)
			.map(([attribute, value]) => shouldInclude(attribute, value as string))
			.some(Boolean);
	}

	if (exclude) {
		const shouldExclude = getAttributeFilter(exclude);
		isExcluded = Object.entries(node.attrs)
			.map(([attribute, value]) => shouldExclude(attribute, value as string))
			.some(Boolean);
	}

	if (isExcluded) {
		return NODE_TYPE.IGNORED;
	}

	if (isIncluded) {
		return NODE_TYPE.DATA_ATTRIBUTE;
	}

	return filterDefault(node);
}

function getAttributeFilter(filterOption: AttributeFilter) {
	if (typeof filterOption === "function") {
		return filterOption;
	}

	if (isRegExp(filterOption)) {
		return (attr: string) => Boolean(filterOption.test(attr));
	}

	return (attribute: string) => {
		const results = filterOption.map((stringOrRegex) => {
			if (isRegExp(stringOrRegex)) {
				return Boolean(stringOrRegex.test(attribute));
			}
			// Simple string match
			return attribute === stringOrRegex;
		});

		return results.some(Boolean);
	};
}

function filterDefault(node: TagAstElement) {
	const { name, attrs } = node;

	if (ICON_NODE_NAMES.has(name) && ICON_ATTRIBUTE in attrs) {
		return NODE_TYPE.DATA_ATTRIBUTE;
	}

	// Custom HTML Element e.g., web component
	if (!HTML_ELEMENTS.includes(name) && ICON_ATTRIBUTE in attrs) {
		return NODE_TYPE.DATA_ATTRIBUTE;
	}

	if (name === "svg") {
		const [useTag] = findTags("use", node);
		if (useTag) {
			const { attrs: nodeAttrs } = useTag;
			return "href" in nodeAttrs || "xlink:href" in nodeAttrs
				? NODE_TYPE.USE_HREF
				: NODE_TYPE.IGNORED;
		}

		return NODE_TYPE.IGNORED;
	}

	return NODE_TYPE.IGNORED;
}
