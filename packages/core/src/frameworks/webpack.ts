/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable import/no-import-module-exports */
import { prerenderStatic } from "@/prerender/static";
import type { IconPrerenderPluginOptions } from "@/types";
import { PLUGIN_NAME } from "@/types";
import type { Compiler, Stats } from "webpack";

// TODO: Make it work during development
interface IconPrerenderPluginWebpackOptions
	extends IconPrerenderPluginOptions {}

export default class IconPrerenderWebpackPlugin {
	private readonly __options: IconPrerenderPluginWebpackOptions;

	/**
	 * Return a new instance of the plugin with user-set configuration options
	 * @param options
	 */
	constructor(options?: IconPrerenderPluginWebpackOptions) {
		this.__options = options ?? {};
	}

	apply(compiler: Compiler) {
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		compiler.hooks.done.tapAsync(PLUGIN_NAME, async (_stats: Stats) => {
			await prerenderStatic({
				...this.__options,
				outDir: compiler.options.output.path ?? "dist",
			});
		});
	}
}

/**
 * Workaround so ES Build allows require() without require().default in consumer
 * See https://github.com/ajv-validator/ajv/issues/1381#issuecomment-798884865
 */
module.exports = IconPrerenderWebpackPlugin;
module.exports.default = IconPrerenderWebpackPlugin;
