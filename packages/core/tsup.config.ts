import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		"astro/index": "src/frameworks/astro.ts",
		"esbuild/index": "src/frameworks/esbuild.ts",
		"rollup/index": "src/frameworks/rollup.ts",
		"webpack/index": "src/frameworks/webpack.ts",
		"vite/index": "src/frameworks/vite.ts",
	},
	format: ["esm", "cjs"],
	splitting: true,
	treeshake: true,
	sourcemap: true,
	dts: true,
	banner(ctx) {
		if (ctx.format === "esm") {
			return {
				js: `import { createRequire } from 'module';const require = createRequire(process.cwd());`,
			};
		}
		return { js: "" };
	},
});
