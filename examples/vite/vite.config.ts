import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import icons from "icon-prerender/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), icons()],
});
