import { describe, expect, it } from "vitest";
import { altFor, fitFor, toItems } from "./gallery";

describe("altFor", () => {
  it("alt útil a partir do nome do ficheiro, ou genérico quando o nome é automático", () => {
    expect(altFor("Promo-Visto_Estudo.png", 0)).toBe("Promo Visto Estudo");
    expect(altFor("IMG_2043.jpg", 2)).toBe("Publicação da Central de Agendamento (3)");
    expect(altFor("12.jpg", 0)).toBe("Publicação da Central de Agendamento (1)");
    expect(altFor("WhatsApp Image 2026.jpeg", 1)).toBe("Publicação da Central de Agendamento (2)");
  });
});

describe("toItems", () => {
  it("caminhos públicos em /images/carousel/, com dimensões e sem links do Drive", () => {
    const [a] = toItems([{ file: "01-promo visto.jpg", width: 1080, height: 1350 }]);
    expect(a).toMatchObject({
      id: "01-promo visto.jpg",
      src: "/images/carousel/01-promo%20visto.jpg",
      full: "/images/carousel/01-promo%20visto.jpg",
      width: 1080,
      height: 1350,
    });
    expect(JSON.stringify(a)).not.toMatch(/drive\.google|googleusercontent|\/api\//);
  });
  it("limita o número de imagens e aceita lista vazia", () => {
    const files = Array.from({ length: 30 }, (_, i) => ({ file: `${i}.png` }));
    expect(toItems(files)).toHaveLength(24);
    expect(toItems(files, "/x", 5)).toHaveLength(5);
    expect(toItems([])).toEqual([]);
  });
  it("caracteres especiais no nome ficam codificados no URL", () => {
    expect(toItems([{ file: "promoção #1 (final).webp" }])[0].src).toBe("/images/carousel/promo%C3%A7%C3%A3o%20%231%20(final).webp");
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
