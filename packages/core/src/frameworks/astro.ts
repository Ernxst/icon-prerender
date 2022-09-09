/* eslint-disable prefer-rest-params */
import { ICON_ATTRIBUTE } from "@/filter/filter";
import { prerenderStatic } from "@/prerender/static";
import type { IconPrerenderPluginOptions } from "@/types";
import { PLUGIN_NAME } from "@/types";
import type { AstroIntegration } from "astro";
import { stripControlCharacters } from "../loader/util";
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
		new URL(`http://${req.headers.host!}`).origin
	);
}

async function prerenderDev(code: string, options: PrerenderOptions) {
	const [node] = HTML.parse(code);

	if (node.type === "tag") {
		return prerenderNode({ node, ...options });
	}

	return code;
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

					// TODO: Will making res.write async affect execution? e.g., slow API
					// @ts-expect-error res.write is not async, but we need it to be
					res.write = async function prerender(chunk: Uint8Array) {
						if (res.getHeader("content-type") === "text/html") {
							try {
								const code = Buffer.from(chunk).toString();

								// If statement required to avoid attempting to process malformed HTML - not sure why this occurs
								if (code.includes(ICON_ATTRIBUTE) || code.includes("<use")) {
									// Should async await even work here? What if `code` was much larger?
									const html = await prerenderDev(
										stripControlCharacters(code),
										{
											outDir: origin,
											...options,
										}
									);

									return resWrite.apply(this, [Buffer.from(html), "utf8"]);
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
