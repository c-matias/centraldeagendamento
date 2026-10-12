import { GALLERY } from "../config/gallery";

export type GalleryItem = { id: string; alt: string; src: string; full: string; width?: number; height?: number };
export type CarouselFile = { file: string; width?: number; height?: number };

/** "Promo-Visto_Estudo.png" → "Promo Visto Estudo"; nomes automáticos (IMG_2043, 12.jpg) → texto genérico. */
export function altFor(file: string, index: number): string {
  const base = file
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  const letters = (base.match(/\p{L}/gu) ?? []).length;
  const looksAuto = /^(img|dsc|image|foto|photo|whatsapp|screenshot)\b/i.test(base) || letters < 4;
  return looksAuto ? `Publicação da Central de Agendamento (${index + 1})` : base;
}

/** Converte a lista descoberta no build (ficheiros de public/images/carousel/) nos itens do carrossel. */
export function toItems(files: CarouselFile[], base: string = GALLERY.publicPath, max: number = GALLERY.maxImages): GalleryItem[] {
  return files.slice(0, max).map((f, i) => {
    const src = `${base}/${encodeURIComponent(f.file)}`;
    return { id: f.file, alt: altFor(f.file, i), src, full: src, width: f.width, height: f.height };
  });
}

/** Decide como encaixar a imagem na moldura: cover só quando quase não corta; caso contrário contain (imagem inteira). */
export function fitFor(
  item: Pick<GalleryItem, "width" | "height">,
  mode: typeof GALLERY.fit = GALLERY.fit,
  frameRatio: number = GALLERY.frameRatio,
): "cover" | "contain" {
  if (mode !== "auto") return mode;
  if (!item.width || !item.height) return "contain";
  const ratio = item.width / item.height;
  return Math.abs(ratio / frameRatio - 1) <= 0.15 ? "cover" : "contain";
}
