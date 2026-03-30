import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import svgr from "vite-plugin-svgr"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	plugins: [reactRouter(), tsconfigPaths(), tailwindcss(), svgr()],
	ssr: {
		noExternal: ["lucide-react", "react-dropzone"],
	},
})
