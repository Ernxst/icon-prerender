import fs from "node:fs";
import path from "node:path";

interface DirectoryHandler {
	dirName: string;
	/**
	 * Creates the temporary directory (named according to `dirName`) and copies
	 * the mock files in `test/mock-dist` to it.
	 *
	 */
	mkdir: () => Promise<void>;
	/**
	 * Deletes the temporary directory
	 */
	rmdir: () => Promise<void>;
}

// Relative from root dir
const TEMP_DIR = path.join("test", "test-mock-dirs");
export const directories: DirectoryHandler[] = [];
let idx = 1;

function generateRandomString(length = 8) {
	return Math.random().toString(20).slice(2, length);
}

/**
 * Create a composable object used for managing a single temporary directory
 * for testing.
 *
 * Used to test the plugin as a whole with real HTML files and SVG elements
 *
 * Allows tests to run in parallel since they use separate directories
 *
 * @returns
 */
export function createDirectoryHandler(): DirectoryHandler {
	const dirName = path.join(
		process.cwd(),
		TEMP_DIR,
		`spec-${idx}-${generateRandomString()}`
	);
	idx += 1;

	const handler = {
		dirName,

		mkdir: async () => {
			if (!fs.existsSync(dirName)) {
				await fs.promises.mkdir(dirName, { recursive: true });
			}

			// Copy our mock output directory to a temporary directory for each test
			await fs.promises.cp("test/mock-dist", dirName, {
				recursive: true,
				force: true,
				dereference: true,
				errorOnExist: false,
				preserveTimestamps: false,
			});
		},

		rmdir: async () => {
			if (fs.existsSync(dirName)) {
				await fs.promises.rm(dirName, { recursive: true, force: true });
			}
		},
	};

	directories.push(handler);

	return handler;
}
