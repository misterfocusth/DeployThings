import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// React Router
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

// Load environment variables from .env
import "../../loadEnv";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  define: {
    "process.env": process.env,
  },
});
