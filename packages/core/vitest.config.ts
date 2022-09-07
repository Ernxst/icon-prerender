import path from "node:path";
import paths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		// https://github.com/aleclarson/vite-tsconfig-paths
		paths(),
	],

	// https://github.com/vitest-dev/vitest
	test: {
		watch: false,
		passWithNoTests: true,
		outputTruncateLength: 120,
		outputDiffLines: 24,
		setupFiles: [path.join(__dirname, "test", "lib", "setup.ts")],
		environment: "jsdom",
		deps: {
			inline: ["svgo"],
		},
		coverage: {
			provider: "istanbul",
			enabled: true,
			extension: ".ts",
			all: true,
			include: ["src/**/*"],
			reporter: ["html", "text-summary", "json"],
			exclude: [
				"src/**/__tests__",
				"src/**/__test__",
				"src/types.ts",
				"src/@types/**/*.ts",
				"src/**/@types/**/*.ts",
				"src/**/*.d.ts",
				"src/resolve/optimise.ts",
				"src/frameworks/**",
			],
		},
	},
});
