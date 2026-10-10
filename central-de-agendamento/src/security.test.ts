import { describe, expect, it } from "vitest";

/** Garante que nenhuma credencial é exposta ao browser. */
describe("segredos", () => {
  const files = import.meta.glob(
    ["./**/*.{ts,tsx,css,html}", "../public/**/*", "../index.html", "../politica-de-privacidade/*.html", "../termos-e-condicoes/*.html"],
    { query: "?raw", import: "default", eager: true },
  ) as Record<string, string>;
  const entries = Object.entries(files).filter(([f]) => !f.endsWith("security.test.ts"));

  it("nenhuma chave da Google (AIza…) nem tokens no código do frontend", () => {
    const bad = entries
      .filter(([, s]) => /AIza[0-9A-Za-z_-]{30,}|ya29\.[0-9A-Za-z_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(s))
      .map(([f]) => f);
    expect(bad).toEqual([]);
  });
  it("o frontend nunca referencia as variáveis secretas (só as funções do Netlify)", () => {
    const bad = entries
      .filter(([f, s]) => !f.includes("config/gallery") && /GOOGLE_DRIVE_API_KEY|VITE_GOOGLE|VITE_DRIVE/.test(s))
      .map(([f]) => f);
    expect(bad).toEqual([]);
  });
  it("o frontend não usa links de partilha/visualização do Drive como imagens", () => {
    const bad = entries
      .filter(
        ([f, s]) =>
          !f.includes("config/gallery") &&
          !f.includes(".test.") &&
          /drive\.google\.com\/(uc|file|thumbnail)|googleusercontent\.com/.test(s),
      )
      .map(([f]) => f);
    expect(bad).toEqual([]);
  });
});
