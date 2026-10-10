/** Lógica do servidor para a galeria (Google Drive API v3). Corre SÓ nas Netlify Functions: a chave nunca vai para o browser. */

export const DEFAULT_FOLDER_ID = "12zbmp1k38-RQZvwSzgCZT-GJDBFF-_pL";
const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const WIDTHS = [320, 640, 960, 1280, 1600, 1920] as const;
const DEFAULT_WIDTH = 960;
const API = "https://www.googleapis.com/drive/v3";
const ID_RE = /^[A-Za-z0-9_-]{10,100}$/;

type Env = Record<string, string | undefined>;
type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  imageMediaMetadata?: { width?: number; height?: number };
};
type GalleryImage = {
  id: string;
  name: string;
  alt: string;
  width?: number;
  height?: number;
  version: string;
  src: string;
  srcSet: string;
  full: string;
};

/** Erro "esperado" com um código estável para o frontend (nunca inclui chaves nem respostas do Google). */
export class GalleryError extends Error {
  constructor(
    public code: "not_configured" | "drive_error" | "forbidden_file" | "bad_request",
    public status: number,
  ) {
    super(code);
  }
}

export function readEnv(env: Env) {
  const apiKey = env.GOOGLE_DRIVE_API_KEY?.trim();
  if (!apiKey) throw new GalleryError("not_configured", 503);
  const max = Math.min(Math.max(Number.parseInt(env.GALLERY_MAX_IMAGES ?? "", 10) || 24, 1), 100);
  return {
    apiKey,
    folderId: env.GOOGLE_DRIVE_FOLDER_ID?.trim() || DEFAULT_FOLDER_ID,
    max,
    order: env.GALLERY_ORDER === "newest" ? ("newest" as const) : ("name" as const),
  };
}

const imageUrl = (id: string, version: string, width?: number) =>
  `/api/gallery/image?id=${encodeURIComponent(id)}&v=${encodeURIComponent(version)}${width ? `&w=${width}` : ""}`;

export const naturalCompare = (a: string, b: string) => a.localeCompare(b, "pt", { numeric: true, sensitivity: "base" });

/** "IMG_2043.jpg", "3f9a…" → texto genérico; "Promo-Visto-Estudo.png" → "Promo Visto Estudo". */
export function altFor(name: string, index: number): string {
  const base = name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  const letters = (base.match(/\p{L}/gu) ?? []).length;
  const looksAuto = /^(img|dsc|image|foto|photo|whatsapp|screenshot)\b/i.test(base) || letters < 4;
  return looksAuto ? `Publicação da Central de Agendamento (${index + 1})` : base;
}

/** Filtra (só JPG/PNG/WebP; ignora pastas, documentos e outros), ordena de forma consistente e limita. */
export function toGalleryImages(files: DriveFile[], opts: { max: number; order: "name" | "newest" }): GalleryImage[] {
  const ok = files.filter((f) => f?.id && ID_RE.test(f.id) && (IMAGE_MIME as readonly string[]).includes(f.mimeType));
  const sorted = [...ok].sort((a, b) =>
    opts.order === "newest"
      ? (b.modifiedTime ?? "").localeCompare(a.modifiedTime ?? "") || naturalCompare(a.name, b.name)
      : naturalCompare(a.name, b.name),
  );
  return sorted.slice(0, opts.max).map((f, i) => {
    const version = (f.modifiedTime ?? "0").replace(/\D/g, "").slice(0, 14) || "0";
    const { width, height } = f.imageMediaMetadata ?? {};
    return {
      id: f.id,
      name: f.name,
      alt: altFor(f.name, i),
      width,
      height,
      version,
      src: imageUrl(f.id, version, 960),
      srcSet: [640, 960, 1280].map((w) => `${imageUrl(f.id, version, w)} ${w}w`).join(", "),
      full: imageUrl(f.id, version, 1920),
    };
  });
}

type Fetch = typeof fetch;

export async function listImages(env: Env, fetchImpl: Fetch = fetch): Promise<GalleryImage[]> {
  const c = readEnv(env);
  const q = `'${c.folderId}' in parents and trashed=false and (${IMAGE_MIME.map((m) => `mimeType='${m}'`).join(" or ")})`;
  const params = new URLSearchParams({
    q,
    key: c.apiKey,
    pageSize: String(Math.min(c.max * 2, 200)),
    orderBy: c.order === "newest" ? "modifiedTime desc" : "name_natural",
    fields: "files(id,name,mimeType,modifiedTime,imageMediaMetadata(width,height))",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });
  let res: Response;
  try {
    res = await fetchImpl(`${API}/files?${params}`, { headers: { Accept: "application/json" } });
  } catch {
    throw new GalleryError("drive_error", 502);
  }
  if (!res.ok) throw new GalleryError("drive_error", 502);
  const data = (await res.json().catch(() => null)) as { files?: DriveFile[] } | null;
  if (!data || !Array.isArray(data.files)) throw new GalleryError("drive_error", 502);
  return toGalleryImages(data.files, c);
}

export const clampWidth = (w: number | undefined) =>
  (WIDTHS as readonly number[]).find((x) => x >= (w ?? DEFAULT_WIDTH)) ?? WIDTHS[WIDTHS.length - 1];

/**
 * Devolve os bytes da imagem redimensionada. Só serve ficheiros que estão NA pasta configurada (evita usar a função como proxy aberto).
 * Pede o thumbnailLink ao Google no momento (não guarda URLs temporários) e, se não existir, usa o ficheiro original.
 */
export async function fetchImage(env: Env, id: string, width: number | undefined, fetchImpl: Fetch = fetch): Promise<Response> {
  const c = readEnv(env);
  if (!ID_RE.test(id)) throw new GalleryError("bad_request", 400);
  const meta = await fetchImpl(
    `${API}/files/${id}?${new URLSearchParams({ key: c.apiKey, fields: "mimeType,parents,thumbnailLink", supportsAllDrives: "true" })}`,
  ).catch(() => null);
  if (!meta || meta.status === 404) throw new GalleryError("forbidden_file", 404);
  if (!meta.ok) throw new GalleryError("drive_error", 502);
  const m = (await meta.json().catch(() => null)) as { mimeType?: string; parents?: string[]; thumbnailLink?: string } | null;
  if (!m?.parents?.includes(c.folderId) || !(IMAGE_MIME as readonly string[]).includes(m.mimeType ?? ""))
    throw new GalleryError("forbidden_file", 404);
  const w = clampWidth(width);
  let upstream: Response | null = null;
  if (m.thumbnailLink && /^https:\/\/[a-z0-9.-]+\.googleusercontent\.com\//i.test(m.thumbnailLink)) {
    upstream = await fetchImpl(m.thumbnailLink.replace(/=s\d+(-[a-z0-9-]+)?$/i, `=w${w}`)).catch(() => null);
  }
  if (!upstream?.ok)
    upstream = await fetchImpl(
      `${API}/files/${id}?${new URLSearchParams({ key: c.apiKey, alt: "media", supportsAllDrives: "true" })}`,
    ).catch(() => null);
  if (!upstream?.ok) throw new GalleryError("drive_error", 502);
  return upstream;
}
