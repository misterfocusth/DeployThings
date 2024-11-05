import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
