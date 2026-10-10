import { afterEach, describe, expect, it, vi } from "vitest";
import gallery from "../functions/gallery";
import galleryImage from "../functions/gallery-image";

const KEY = "SEGREDO_DE_TESTE_123";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
const req = (path: string, method = "GET") => new Request(`https://site.test${path}`, { method });

describe("função gallery", () => {
  it("200 com imagens e cabeçalhos de cache (CDN + browser)", async () => {
    vi.stubEnv("GOOGLE_DRIVE_API_KEY", KEY);
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              files: [{ id: "file_id_0001", name: "a.jpg", mimeType: "image/jpeg", modifiedTime: "2026-10-01T10:00:00Z" }],
            }),
          ),
      ),
    );
    const r = await gallery(req("/api/gallery"));
    expect(r.status).toBe(200);
    expect(r.headers.get("netlify-cdn-cache-control")).toContain("s-maxage=300");
    expect(r.headers.get("cache-control")).toContain("max-age=60");
    const body = await r.json();
    expect(body.images).toHaveLength(1);
    expect(JSON.stringify(body)).not.toContain(KEY);
  });
  it("sem chave → 503 not_configured, sem cache e sem pedidos ao Google", async () => {
    vi.stubEnv("GOOGLE_DRIVE_API_KEY", "");
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await gallery(req("/api/gallery"));
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: "not_configured" });
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(f).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith("[gallery] not_configured");
  });
  it("erro do Google → 502 e a chave nunca aparece na resposta nem nos logs", async () => {
    vi.stubEnv("GOOGLE_DRIVE_API_KEY", KEY);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(`erro com key=${KEY}`, { status: 403 })),
    );
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await gallery(req("/api/gallery"));
    expect(r.status).toBe(502);
    expect(await r.text()).not.toContain(KEY);
    expect(JSON.stringify(spy.mock.calls)).not.toContain(KEY);
  });
  it("só aceita GET", async () => {
    expect((await gallery(req("/api/gallery", "POST"))).status).toBe(405);
  });
});

describe("função gallery-image", () => {
  const meta = {
    mimeType: "image/png",
    parents: ["12zbmp1k38-RQZvwSzgCZT-GJDBFF-_pL"],
    thumbnailLink: "https://lh3.googleusercontent.com/x=s220",
  };
  it("devolve a imagem com cache imutável quando o URL tem versão", async () => {
    vi.stubEnv("GOOGLE_DRIVE_API_KEY", KEY);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (u: string) =>
        String(u).includes("googleapis")
          ? new Response(JSON.stringify(meta))
          : new Response("PNG", { headers: { "content-type": "image/png" } }),
      ),
    );
    const r = await galleryImage(req("/api/gallery/image?id=file_id_0001&v=1&w=640"));
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toBe("image/png");
    expect(r.headers.get("cache-control")).toContain("immutable");
    expect(r.headers.get("x-content-type-options")).toBe("nosniff");
    const noVersion = await galleryImage(req("/api/gallery/image?id=file_id_0001"));
    expect(noVersion.headers.get("cache-control")).toBe("public, max-age=3600");
  });
  it("id inválido → 400; ficheiro fora da pasta → 404; sem chave → 503", async () => {
    vi.stubEnv("GOOGLE_DRIVE_API_KEY", KEY);
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await galleryImage(req("/api/gallery/image?id=../x"))).status).toBe(400);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ...meta, parents: ["outra"] }))),
    );
    expect((await galleryImage(req("/api/gallery/image?id=file_id_0001"))).status).toBe(404);
    vi.stubEnv("GOOGLE_DRIVE_API_KEY", "");
    expect((await galleryImage(req("/api/gallery/image?id=file_id_0001"))).status).toBe(503);
  });
});
