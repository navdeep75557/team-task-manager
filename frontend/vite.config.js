import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://team-task-manager-production-0f44.up.railway.app",
        changeOrigin: true,
        secure: true
      }
    }
  }
});
