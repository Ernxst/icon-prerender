import { describe, expect, test } from "vitest";
import { isUrl } from "../util";

const TEST_CASES = {
	// Valid
	"http://www.ernestbadu.me/": true,
	"http://www.ernestbadu.me": true,
	"http://www.ernestbadu.me/blog": true,
	"http://www.ernestbadu.me/foo/bar/test.html": true,
	"http://www.ernestbadu.me/?foo=bar": true,
	"http://www.ernestbadu.me:8080/test.html": true,
	"http://example.w3.org/path%20with%20spaces.html": true,
	"http://192.168.0.1/": true,
	"http://localhost:/8080": true,

	// Invalid
	"/path/icon.svg": false,
	"/path/icon.svg#id": false,
	"ftp://ftp.ernestbadu.me": false,
	"mdi:chevron-right": false,
	"#": false,
	"1": false,
	"11111111111111111": false,
};

describe.concurrent("Is external URL", () => {
	for (const [input, expected] of Object.entries(TEST_CASES)) {
		test(`Should return ${String(expected)} for ${input}`, () => {
			expect(isUrl(input)).toBe(expected);
		});
	}
});
