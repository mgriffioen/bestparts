import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      name: "unit",
      environment: "jsdom",
      include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
      setupFiles: ["./tests/setup/vitest.setup.ts"],
    },
  },
  {
    extends: "./vitest.config.ts",
    test: {
      name: "integration",
      environment: "node",
      include: ["tests/integration/**/*.test.ts"],
      setupFiles: ["./tests/setup/vitest.setup.ts"],
      globalSetup: ["./tests/setup/test-db.ts"],
      pool: "forks",
      testTimeout: 30_000,
      hookTimeout: 30_000,
    },
  },
]);
