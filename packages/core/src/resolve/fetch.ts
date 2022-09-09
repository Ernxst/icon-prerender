import { PLUGIN_NAME } from "@/types";

// Taken from https://github.com/natemoo-re/astro-icon/blob/main/packages/core/lib/resolver.ts
/**
 * Stores requests that are currently being made.
 *
 * If a request to the same URL is made while another has not yet completed,
 * the in flight request will be returned.
 *
 * Once the request is complete, it is removed from this cache
 */
export const inFlightRequests = new Map<string, Promise<string>>();
/**
 * Cache to avoid extra fetch requests
 */
export const fetchCache = new Map<string, string>();

export async function fetchSvgFromService(url: string) {
	if (inFlightRequests.has(url)) {
		// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
		return inFlightRequests.get(url) as Promise<string>;
	}

	if (fetchCache.has(url)) {
		// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
		return fetchCache.get(url) as string;
	}

	const fetchIcon = async () => {
		const res = await fetch(new URL(url));
		if (!res.ok) {
			throw new Error(await res.text());
		}

		const contentType = res.headers.get("Content-Type");
		if (!contentType || !contentType.includes("svg")) {
			throw new Error(`[${PLUGIN_NAME}] Unable to load SVG from "${url}" because it did not resolve to an SVG!
Received the following "Content-Type":
${contentType ?? ""}`);
		}

		const svg = await res.text();
		fetchCache.set(url, svg);
		inFlightRequests.delete(url);
		return svg;
	};

	const svgPromise = fetchIcon();
	inFlightRequests.set(url, svgPromise);
	return svgPromise;
}
