import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { findPriceTable, scanCarousel, siteAssets } from "./site-assets";

const FIX = join(process.cwd(), "e2e/fixtures");
const tmp: string[] = [];
const mk = () => {
  const d = mkdtempSync(join(tmpdir(), "ca-"));
  tmp.push(d);
  return d;
};
afterEach(() => {
  while (tmp.length) rmSync(tmp.pop() as string, { recursive: true, force: true });
});

describe("scanCarousel", () => {
  it("pasta inexistente ou vazia → lista vazia (a galeria mostra a mensagem 'ainda não há publicações')", () => {
    expect(scanCarousel(join(tmpdir(), "nao-existe-ca"))).toEqual([]);
    expect(scanCarousel(mk())).toEqual([]);
  });
  it("só JPG/JPEG/PNG/WebP; ignora subpastas, ocultos (.gitkeep), documentos e outros formatos", () => {
    const d = mk();
    for (const n of ["a.png", "b.JPG", "c.jpeg", "d.webp"]) copyFileSync(join(FIX, "carousel/01-vertical45.png"), join(d, n));
    for (const n of [".gitkeep", "nota.txt", "doc.pdf", "anim.gif", "icone.svg", "semextensao"]) writeFileSync(join(d, n), "x");
    mkdirSync(join(d, "subpasta.png"));
    expect(scanCarousel(d).map((i) => i.file)).toEqual(["a.png", "b.JPG", "c.jpeg", "d.webp"]);
  });
  it("ordem natural dos nomes (2 antes de 10) e lê as dimensões reais", () => {
    const d = mk();
    const src = join(FIX, "carousel");
    copyFileSync(join(src, "03-horizontal.png"), join(d, "10-promo.png"));
    copyFileSync(join(src, "01-vertical45.png"), join(d, "2-promo.png"));
    copyFileSync(join(src, "02-quadrada.png"), join(d, "1-promo.png"));
    expect(scanCarousel(d)).toEqual([
      { file: "1-promo.png", width: 360, height: 360 },
      { file: "2-promo.png", width: 360, height: 450 },
      { file: "10-promo.png", width: 640, height: 360 },
    ]);
  });
  it("ficheiro corrompido aparece na mesma, sem dimensões", () => {
    const d = mk();
    writeFileSync(join(d, "estragada.jpg"), "isto não é uma imagem");
    expect(scanCarousel(d)).toEqual([{ file: "estragada.jpg" }]);
  });
});

describe("findPriceTable", () => {
  it("null enquanto o ficheiro não existir", () => {
    expect(findPriceTable(mk())).toBeNull();
    expect(findPriceTable(join(tmpdir(), "nao-existe-ca"))).toBeNull();
  });
  it("encontra tabela-precos.jpg/.jpeg/.png/.webp e lê as dimensões; ignora outros nomes", () => {
    const d = mk();
    copyFileSync(join(FIX, "tabela-precos.png"), join(d, "outra-coisa.png"));
    expect(findPriceTable(d)).toBeNull();
    copyFileSync(join(FIX, "tabela-precos.png"), join(d, "tabela-precos.png"));
    expect(findPriceTable(d)).toEqual({ file: "tabela-precos.png", width: 900, height: 1200 });
    const e = mk();
    copyFileSync(join(FIX, "tabela-precos.png"), join(e, "tabela-precos.webp"));
    expect(findPriceTable(e)?.file).toBe("tabela-precos.webp"); // extensão é só o nome: dimensões podem não ser lidas
  });
});

describe("plugin (módulos virtuais)", () => {
  it("resolve e gera os módulos a partir da raiz do projecto", () => {
    const p = siteAssets(mk()) as unknown as { resolveId: (id: string) => string | undefined; load: (id: string) => string | undefined };
    expect(p.resolveId("virtual:carousel-images")).toBe("\0virtual:carousel-images");
    expect(p.resolveId("virtual:price-table")).toBe("\0virtual:price-table");
    expect(p.resolveId("outro")).toBeUndefined();
    expect(p.load("\0virtual:carousel-images")).toBe("export default [];");
    expect(p.load("\0virtual:price-table")).toBe("export default null;");
    expect(p.load("\0outro")).toBeUndefined();
  });
});
