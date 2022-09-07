import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import icons from "icon-prerender/astro";

// https://astro.build/config
export default defineConfig({
	site: "https://www.example.com",
	integrations: [mdx(), sitemap(), icons()],
});
