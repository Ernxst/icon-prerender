import { PLUGIN_NAME } from "@/types";
import { test, describe, expect, beforeEach, vi } from "vitest";
import { getIconifyIcon, ICON_PACKS } from "../iconify";

function isValidHTML(html: string) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/xml");
	const error = doc.documentElement.querySelector("parsererror");
	return error ? error.textContent : true;
}

// Do not run concurrently since file has side effects
describe("Load iconify icon from node modules", () => {
	beforeEach(() => {
		ICON_PACKS.clear();
	});

	test("Loaded icon should be valid HTML", async () => {
		const svg = await getIconifyIcon("feather", "edit");
		expect(isValidHTML(svg)).toBe(true);
	});

	test("Should load a valid pack", async () => {
		const packSizeBefore = ICON_PACKS.size;
		await getIconifyIcon("feather", "edit");
		const packSizeAfter = ICON_PACKS.size;
		expect(packSizeAfter).toBeGreaterThan(packSizeBefore);
	});

	test("Should not load the same pack twice", async () => {
		const packSpy = vi.spyOn(ICON_PACKS, "set");

		expect(packSpy).not.toHaveBeenCalled();
		await getIconifyIcon("feather", "edit");

		expect(packSpy).toHaveBeenCalled();
		await getIconifyIcon("feather", "edit");

		expect(packSpy).toHaveBeenCalledOnce();
	});

	test("Should throw an error if the icon pack does not exist", async () => {
		const pack = "unknown";
		await expect(() =>
			getIconifyIcon(pack, "chevron-right")
		).rejects.toThrowError(
			`[${PLUGIN_NAME}] could not find icon pack "${pack}"`
		);
	});

	test("Should throw an error if the icon does not exist in the pack", async () => {
		const pack = "mdi";
		const icon = "doesnotexist";
		await expect(() => getIconifyIcon(pack, icon)).rejects.toThrowError(
			`[${PLUGIN_NAME}] could not find "${icon}" in icon pack "${pack}"`
		);
	});
});
