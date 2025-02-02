import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginSvelte from "eslint-plugin-svelte";
import svelteConfig from "./svelte.config.js";
import eslintConfigPrettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ files: ["**/*.{js,mjs,cjs,ts}"] },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	...eslintPluginSvelte.configs["flat/recommended"],
	eslintConfigPrettier,
	{
		ignores: ["dist/"],
	},
	{
		files: ["**/*.svelte", "*.svelte"],
		languageOptions: {
			parserOptions: {
				svelteConfig,
			},
		},
	},
];
