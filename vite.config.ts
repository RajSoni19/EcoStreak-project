import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Clean frontend-only Vite config
export default defineConfig({
  server: {
    host: "localhost",
    port: 3000,
  },
  build: {
    outDir: "dist",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
