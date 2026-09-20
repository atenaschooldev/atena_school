import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@atena/core": path.resolve(__dirname, "../../packages/core/src"),
      "@atena/utils": path.resolve(__dirname, "../../packages/utils/src"),
      "@atena/api-types": path.resolve(__dirname, "../../packages/api-types/src"),
      "@atena/validators": path.resolve(__dirname, "../../packages/validators/src"),
      "@repo/api": path.resolve(__dirname, "../../packages/api-client/src"),
      "@repo/design": path.resolve(__dirname, "../../packages/design/src"),
    },
  },
});
