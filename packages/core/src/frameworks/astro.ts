/* eslint-disable prefer-rest-params */
import { ICON_ATTRIBUTE } from "@/filter/filter";
import { prerenderStatic } from "@/prerender/static";
import type { IconPrerenderPluginOptions } from "@/types";
import { PLUGIN_NAME } from "@/types";
import type { AstroIntegration } from "astro";
import HTML from "html-parse-stringify";
import type { Connect } from "vite";
import type { PrerenderOptions } from "@/prerender/util";
import { prerenderNode } from "@/prerender/util";

// TODO: Small bug: requires an initial reload on server startup (no cache) to show full page

export interface AstroIconPrerenderIntegrationOptions
	extends IconPrerenderPluginOptions {}

function getUrlOrigin(req: Connect.IncomingMessage) {
	return (
		req.headers.origin ??
		req.headers.referer ??
		// Unfortunately, we have to assume it runs on `http`
		new URL(`http://${req.headers.host ?? ""}`).origin
	);
}

async function prerenderDev(code: string, options: PrerenderOptions) {
	// Add spaces around comments
	code = code.replaceAll(/(<!--.*-->)/g, " $1 ");

	const nodes = HTML.parse(code);
	let processedCode = "";

	/**
	 * We are processing raw HTML here, so it is safe to use the buggy stringify function over an AST
	 *
	 *  */
	for (const node of nodes) {
		processedCode +=
			node.type === "tag"
				? await prerenderNode({ node, ...options })
				: HTML.stringify([node]);
	}

	return processedCode;
}
/**
 * Astro integration to replace icons with the actual SVG element at build time.
 */
export default function icons(
	options?: AstroIconPrerenderIntegrationOptions
): AstroIntegration {
	return {
		name: PLUGIN_NAME,
		hooks: {
			"astro:build:done": async ({ dir }) => {
				await prerenderStatic({ ...options, outDir: dir.pathname });
			},
			"astro:server:setup": ({ server }) => {
				server.middlewares.use((req, res, next) => {
					const origin = getUrlOrigin(req);
					const resWrite = res.write.bind(res);

					/**
					 * Idea: intercept `res.write` to rewrite HTML files
					 */

					res.write = function prerender(chunk: Uint8Array) {
						if (res.getHeader("content-type") === "text/html") {
							try {
								const code = Buffer.from(chunk).toString();

								// If statement required to avoid attempting to process malformed HTML - not sure why this occurs
								if (code.includes(ICON_ATTRIBUTE) || code.includes("<use")) {
									// Should async await even work here? What if `code` was much larger?
									void prerenderDev(code, {
										outDir: origin,
										...options,
									}).then((html) => {
										resWrite.apply(this, [Buffer.from(html), "utf8"]);
									});
								}
							} catch (error) {
								server.ssrFixStacktrace(error as never);
								next(error);
							}
						}

						// @ts-expect-error no clue why `arguments` is of the wrong type
						return resWrite.apply(this, arguments);
					};

					next();
				});
			},
		},
	};
}
