import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    proxy: {
      "/admin": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
      "/v1": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@atena/core": path.resolve(__dirname, "../../packages/core/src"),
      "@atena/utils": path.resolve(__dirname, "../../packages/utils/src"),
      "@atena/api-types": path.resolve(__dirname, "../../packages/api-types/src"),
    },
  },
  define: {
    'import.meta.env.VITE_BASENAME': JSON.stringify(process.env.VITE_BASENAME || ''),
  }
})