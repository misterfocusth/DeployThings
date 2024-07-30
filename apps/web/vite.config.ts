import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Load environment variables from .env
import "../../loadEnv";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": process.env,
  },
});
