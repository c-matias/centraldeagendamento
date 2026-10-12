import { defineConfig } from "vitest/config";

// Config leve só para mutation testing: testes de lógica pura, sem DOM.
export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify("dev") },
  test: {
    environment: "node",
    include: ["src/lib/**/*.test.ts", "src/observability/*.test.ts"],
  },
});
