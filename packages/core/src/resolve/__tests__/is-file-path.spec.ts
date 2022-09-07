import { describe, expect, test } from "vitest";
import { isFilePath } from "../util";

const TEST_CASES = {
	// Valid
	"assets/icons.svg": true,
	"/path/icon.svg": true,
	"/path/icon.svg#id": true,

	// Invalid
	"http://www.ernestbadu.me": false,
	"http://www.ernestbadu.me/blog": false,
	"http://www.ernestbadu.me/foo/bar/test.html": false,
	"http://www.ernestbadu.me/?foo=bar": false,
	"http://www.ernestbadu.me:8080/test.html": false,
	"http://example.w3.org/path%20with%20spaces.html": false,
	"http://192.168.0.1/": false,
	"http://localhost:/8080": false,
	"ftp://ftp.ernestbadu.me": false,
	"mdi:chevron-right": false,
	"#": false,
	"1": false,
	"11111111111111111": false,
};

describe.concurrent("Is file path", () => {
	for (const [input, expected] of Object.entries(TEST_CASES)) {
		test(`Should return ${String(expected)} for ${input}`, () => {
			expect(isFilePath(input)).toBe(expected);
		});
	}
});
