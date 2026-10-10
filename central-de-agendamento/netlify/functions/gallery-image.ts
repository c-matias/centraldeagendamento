import { clampWidth, fetchImage, GalleryError } from "../lib/drive";

export const config = { path: "/api/gallery/image" };

/** Serve uma imagem da pasta (redimensionada). Com `v` (versão do ficheiro) a cache é imutável: o URL muda quando a imagem muda. */
export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const w = Number.parseInt(url.searchParams.get("w") ?? "", 10) || undefined;
  const versioned = url.searchParams.has("v");
  try {
    const upstream = await fetchImage(process.env, id, clampWidth(w));
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": versioned ? "public, max-age=31536000, immutable" : "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    const err = e instanceof GalleryError ? e : new GalleryError("drive_error", 502);
    console.error(`[gallery-image] ${err.code}`);
    return new Response(err.code, { status: err.status, headers: { "Cache-Control": "no-store", "Content-Type": "text/plain" } });
  }
};
