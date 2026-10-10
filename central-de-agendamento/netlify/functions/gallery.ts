import { GalleryError, listImages } from "../lib/drive";

export const config = { path: "/api/gallery" };

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...headers } });

/** Lista as imagens da pasta do Drive. Cache: 5 min no CDN do Netlify (+ stale-while-revalidate) e 60 s no browser. */
export default async (req: Request): Promise<Response> => {
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405, { Allow: "GET", "Cache-Control": "no-store" });
  try {
    const images = await listImages(process.env);
    return json({ images, updatedAt: new Date().toISOString() }, 200, {
      "Cache-Control": "public, max-age=60",
      "Netlify-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    });
  } catch (e) {
    const err = e instanceof GalleryError ? e : new GalleryError("drive_error", 502);
    console.error(`[gallery] ${err.code}`); // nunca registar URLs (contêm a chave) nem respostas do Google
    return json({ error: err.code }, err.status, { "Cache-Control": "no-store" });
  }
};
