import { loadCollection } from "@iconify/json";
import type { IconifyJSON } from "@iconify/types";
import { getIconData } from "@iconify/utils";
import fs from "node:fs";
import path from "node:path";

import { PLUGIN_NAME } from "@/types";
import glob from "fast-glob";
import HTML from "html-parse-stringify";

export const ICON_PACKS = new Map<string, IconifyJSON>();

async function loadPack(pack: string) {
	const pattern = path.join(
		"node_modules",
		"@iconify",
		"json",
		"json",
		`${pack}.json`
	);
	const paths = await glob(pattern);

	if (paths.length === 0 || !fs.existsSync(paths[0])) {
		throw new Error(`[${PLUGIN_NAME}] could not find icon pack "${pack}"
		  - have you run "npm install --save-dev @iconify/json" ?`);
	}

	const icons = await loadCollection(paths[0]);
	ICON_PACKS.set(pack, icons);
}

export async function getIconifyIcon(pack: string, name: string) {
	if (!ICON_PACKS.has(pack)) {
		await loadPack(pack);
	}

	const iconPack = ICON_PACKS.get(pack) as IconifyJSON;
	const iconData = getIconData(iconPack, name, false);
	if (!iconData) {
		throw new Error(
			`[${PLUGIN_NAME}] could not find "${name}" in icon pack "${pack}"`
		);
	}

	const svg: TagAstElement = {
		name: "svg",
		type: "tag",
		attrs: {
			xmlns: "http://www.w3.org/2000/svg",
			"xmlns:xlink": "http://www.w3.org/1999/xlink",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
		},
		children: HTML.parse(iconData.body),
		voidElement: false,
	};

	return HTML.stringify([svg]);
}
