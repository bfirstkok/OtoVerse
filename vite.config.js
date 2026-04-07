import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id || !id.includes("node_modules")) return;
          if (id.includes("firebase")) return "firebase";
          if (id.includes("framer-motion")) return "motion";
          return "vendor";
        }
      }
    }
  }
});
