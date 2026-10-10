import { describe, expect, it } from "vitest";
import { CACHE_KEY, fitFor, isFresh, parseGallery, readCache, writeCache } from "./gallery";

const img = (n: number, extra = {}) => ({
  id: `id_${n}`,
  alt: `Imagem ${n}`,
  src: `/api/gallery/image?id=id_${n}`,
  full: `/api/gallery/image?id=id_${n}&w=1920`,
  ...extra,
});
const store = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
};

describe("parseGallery", () => {
  it("aceita só URLs do próprio site (nunca http(s) externos nem links do Drive) e limita", () => {
    const out = parseGallery(
      {
        images: [
          img(1),
          { ...img(2), src: "https://drive.google.com/uc?id=2" },
          { ...img(3), src: "//evil.example/x.jpg" },
          img(4),
          { id: "", src: "/x" },
          null,
        ],
      },
      5,
    );
    expect(out.map((i) => i.id)).toEqual(["id_1", "id_4"]);
    expect(parseGallery({ images: [img(1), img(2), img(3)] }, 2)).toHaveLength(2);
  });
  it("alt por omissão, full por omissão = src, ignora srcSet externo e dimensões inválidas", () => {
    const [a] = parseGallery({ images: [{ id: "a", src: "/x", alt: 5, srcSet: "https://x/y 1w", width: -1, height: "9" }] });
    expect(a).toMatchObject({
      alt: "Publicação da Central de Agendamento",
      full: "/x",
      srcSet: undefined,
      width: undefined,
      height: undefined,
    });
  });
  it("rejeita formatos inválidos", () => {
    for (const bad of [null, {}, { images: "x" }, "texto", 42]) expect(() => parseGallery(bad)).toThrow();
    expect(parseGallery({ images: [] })).toEqual([]);
  });
});

describe("cache", () => {
  it("guarda e lê; valida a frescura pelo TTL", () => {
    const s = store();
    writeCache([parseGallery({ images: [img(1)] })[0]], 1000, s);
    const c = readCache(s);
    expect(c?.items).toHaveLength(1);
    expect(isFresh(c, 1000 + 1000, 5000)).toBe(true);
    expect(isFresh(c, 1000 + 6000, 5000)).toBe(false);
    expect(isFresh(null)).toBe(false);
  });
  it("ignora lixo, formatos antigos e armazenamento indisponível", () => {
    const s = store();
    s.setItem(CACHE_KEY, "{lixo");
    expect(readCache(s)).toBeNull();
    s.setItem(CACHE_KEY, JSON.stringify({ at: "x", items: [] }));
    expect(readCache(s)).toBeNull();
    expect(
      readCache({
        getItem: () => {
          throw new Error("bloqueado");
        },
      }),
    ).toBeNull();
    expect(() =>
      writeCache([], 1, {
        setItem: () => {
          throw new Error("cheio");
        },
      }),
    ).not.toThrow();
    expect(readCache(undefined)).toBeNull();
  });
});

describe("fitFor", () => {
  it("auto: cover só quando a proporção é parecida com a moldura (4:5); senão a imagem inteira", () => {
    expect(fitFor({ width: 1080, height: 1350 })).toBe("cover");
    expect(fitFor({ width: 1000, height: 1100 })).toBe("cover");
    expect(fitFor({ width: 1080, height: 1080 })).toBe("contain");
    expect(fitFor({ width: 1920, height: 1080 })).toBe("contain");
    expect(fitFor({ width: 1080, height: 1920 })).toBe("contain");
    expect(fitFor({})).toBe("contain");
  });
  it("modos forçados", () => {
    expect(fitFor({ width: 1920, height: 1080 }, "cover")).toBe("cover");
    expect(fitFor({ width: 1080, height: 1350 }, "contain")).toBe("contain");
  });
});
