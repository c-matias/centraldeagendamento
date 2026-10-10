import { GALLERY } from "../config/gallery";

export type GalleryItem = { id: string; alt: string; src: string; srcSet?: string; full: string; width?: number; height?: number };
export type Cached = { at: number; items: GalleryItem[] };

export const CACHE_KEY = "ca:gallery:v1";

/** Só caminhos do próprio site: recusa http(s) externos e URLs relativos ao protocolo (//host). */
const isLocal = (v: string) => v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\");
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : undefined);

/** Valida a resposta da API (nunca confiar no formato) e aceita só URLs do próprio site. */
export function parseGallery(data: unknown, max: number = GALLERY.maxImages): GalleryItem[] {
  const list = (data as { images?: unknown } | null)?.images;
  if (!Array.isArray(list)) throw new Error("formato inválido");
  const items: GalleryItem[] = [];
  for (const r of list as Record<string, unknown>[]) {
    if (!isStr(r?.id) || !isStr(r?.src) || !isLocal(r.src)) continue;
    items.push({
      id: r.id,
      alt: isStr(r.alt) ? r.alt : "Publicação da Central de Agendamento",
      src: r.src,
      srcSet: isStr(r.srcSet) && isLocal(r.srcSet) ? r.srcSet : undefined,
      full: isStr(r.full) && isLocal(r.full) ? r.full : r.src,
      width: num(r.width),
      height: num(r.height),
    });
    if (items.length >= max) break;
  }
  return items;
}

export function readCache(storage: Pick<Storage, "getItem"> | undefined = safeStorage()): Cached | null {
  try {
    const raw = storage?.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Cached;
    if (typeof c?.at !== "number" || !Array.isArray(c.items)) return null;
    return { at: c.at, items: parseGallery({ images: c.items }) };
  } catch {
    return null;
  }
}

export function writeCache(items: GalleryItem[], now = Date.now(), storage: Pick<Storage, "setItem"> | undefined = safeStorage()): void {
  try {
    storage?.setItem(CACHE_KEY, JSON.stringify({ at: now, items } satisfies Cached));
  } catch {
    /* armazenamento cheio ou bloqueado: ignorar */
  }
}

export const isFresh = (c: Cached | null, now = Date.now(), ttl: number = GALLERY.cacheTtlMs) => !!c && now - c.at < ttl;

function safeStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
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

export const SIZES = "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw";
