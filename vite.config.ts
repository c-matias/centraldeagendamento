/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { type Connect, defineConfig, type Plugin } from "vite";
import { siteAssets } from "./vite-plugins/site-assets";

const LEGAL_ROUTES = ["/politica-de-privacidade", "/termos-e-condicoes"];
const page = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/** Em dev e preview, `/politica-de-privacidade` serve `/politica-de-privacidade/index.html` (no Netlify faz-o o `_redirects`). */
function legalRoutes(): Plugin {
  const rewrite: Connect.NextHandleFunction = (req, _res, next) => {
    const [path, query] = (req.url ?? "").split("?");
    if (LEGAL_ROUTES.includes(path)) req.url = `${path}/${query ? `?${query}` : ""}`;
    next();
  };
  return {
    name: "legal-routes",
    configureServer: (s) => void s.middlewares.use(rewrite),
    configurePreviewServer: (s) => void s.middlewares.use(rewrite),
  };
}

export default defineConfig({
  plugins: [react(), legalRoutes(), siteAssets()],
  define: { __APP_VERSION__: JSON.stringify(process.env.COMMIT_REF?.slice(0, 7) ?? "dev") },
  build: {
    rollupOptions: {
      input: {
        main: page("./index.html"),
        privacidade: page("./politica-de-privacidade/index.html"),
        termos: page("./termos-e-condicoes/index.html"),
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "vite-plugins/**/*.test.ts"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      include: ["src/**/*.{ts,tsx}", "vite-plugins/**/*.ts"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/main.tsx",
        "src/pages/main.tsx",
        "src/vite-env.d.ts",
        "src/observability/{sentry,datadog,newrelic,otel}.ts",
      ],
      thresholds: { lines: 90, statements: 90, branches: 80, functions: 70 },
    },
  },
});
