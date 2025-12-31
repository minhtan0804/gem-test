// vitest.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["**/*.test.tsx"],
    reporters: ["default", "html"],
    outputFile: {
      html: "./html-report/index.html",
    },
    globals: true,
    setupFiles: "./vitest-setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/**/*.test.tsx",
        "src/**/__test__/**",
        "html-report/",
        "*.config.*",
        "vitest-setup.ts",
        "vitest.config.ts",
        "scripts/**",
        "src/main.tsx",
        "src/main.ts",
      ],
    },
  },
});
