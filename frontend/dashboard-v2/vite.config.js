import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/dashboard-v2/",
  build: {
    outDir: "../../htdocs/dashboard-v2",
    emptyOutDir: true
  },
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  }
});
