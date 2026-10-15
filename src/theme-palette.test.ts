import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// (o Vitest está com css:false, por isso lê-se o ficheiro directamente)
const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const css = read("src/index.css");
const tailwindConfig = read("tailwind.config.js");

type RGB = [number, number, number];
const block = (sel: string) => {
  const m = css.match(new RegExp(`${sel.replace(".", "\\.")}\\s*{([^}]*)}`));
  if (!m) throw new Error(`bloco ${sel} não encontrado`);
  return Object.fromEntries(
    [...m[1].matchAll(/--([\w-]+):\s*(\d+) (\d+) (\d+);/g)].map((x) => [x[1], [Number(x[2]), Number(x[3]), Number(x[4])] as RGB]),
  );
};
const light = block(":root");
const dark = block(".dark");

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]: RGB) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a: RGB, b: RGB) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const isRed = ([r, g, b]: RGB) => r > 140 && r > g * 1.6 && r > b * 1.6;
const WHITE: RGB = [255, 255, 255];

describe("paleta do tema (claro e escuro)", () => {
  it("os dois modos definem exactamente as mesmas variáveis", () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
    expect(Object.keys(light).length).toBeGreaterThanOrEqual(12);
  });
  it("NENHUMA cor é vermelha (nem em variáveis, nem no Tailwind, nem no CSS)", () => {
    for (const [mode, vars] of [
      ["claro", light],
      ["escuro", dark],
    ] as const)
      for (const [name, rgb] of Object.entries(vars)) expect(isRed(rgb), `${mode}: --${name}`).toBe(false);
    expect(css).not.toMatch(/\b(red|crimson|tomato|firebrick)\b|#(?:f00|ff0000|e53935|dc2626|ef4444)\b/i);
    expect(tailwindConfig).not.toMatch(/\b(red|rose|pink|orange)\b/i);
  });
  it("modo claro mantém o aspecto actual (valores originais da marca)", () => {
    expect(light.page).toEqual([255, 255, 255]);
    expect(light.brand).toEqual([16, 16, 112]);
    expect(light.royal).toEqual([35, 80, 217]);
    expect(light.soft).toEqual([245, 247, 250]);
  });
  it("modo escuro é realmente escuro e usa tons de azul", () => {
    expect(lum(dark.page)).toBeLessThan(0.02);
    expect(lum(dark.surface)).toBeLessThan(0.03);
    for (const k of ["page", "surface", "soft", "brand", "royal"]) expect(dark[k][2], k).toBeGreaterThan(dark[k][0]);
  });
  describe.each([
    ["claro", light],
    ["escuro", dark],
  ] as const)("contraste WCAG AA (%s)", (_m, t) => {
    it.each([
      ["texto principal", "ink", "page", 7],
      ["texto principal em cartões", "ink", "surface", 7],
      ["texto secundário", "muted", "page", 4.5],
      ["texto secundário em cartões", "muted", "surface", 4.5],
      ["texto secundário em secções alternadas", "muted", "soft", 4.5],
      ["títulos/destaques", "fg-brand", "page", 7],
      ["títulos em cartões", "fg-brand", "surface", 7],
      ["links e ícones azuis", "fg-royal", "page", 4.5],
      ["links em cartões", "fg-royal", "surface", 4.5],
      ["links em secções alternadas", "fg-royal", "soft", 4.5],
    ] as const)("%s", (_n, fg, bg, min) => {
      expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(min);
    });
    it("texto branco sobre botões e faixas azuis", () => {
      expect(contrast(WHITE, t.brand)).toBeGreaterThanOrEqual(7);
      expect(contrast(WHITE, t.royal)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(WHITE, t["brand-dark"])).toBeGreaterThanOrEqual(7);
    });
  });
});
