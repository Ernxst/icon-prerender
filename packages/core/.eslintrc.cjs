/**
 * @type {import("eslint").Linter.BaseConfig}
 */
module.exports = {
	extends: [require.resolve("@icon-prerender/eslint/eslintrc.cjs")],
	ignorePatterns: ["**/*.tsx"],
	overrides: [
		{
			files: ["*.ts"],
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: ["./tsconfig.json"],
			},
		},
	],
};
