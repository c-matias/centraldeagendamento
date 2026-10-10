import { describe, expect, it, vi } from "vitest";
import {
  altFor,
  clampWidth,
  DEFAULT_FOLDER_ID,
  fetchImage,
  GalleryError,
  listImages,
  naturalCompare,
  readEnv,
  toGalleryImages,
} from "./drive";

const KEY = "TEST_KEY_not_real";
const env = { GOOGLE_DRIVE_API_KEY: KEY, GOOGLE_DRIVE_FOLDER_ID: "FOLDER_ID_123456" };
const f = (id: string, name: string, mimeType = "image/jpeg", extra = {}) => ({
  id,
  name,
  mimeType,
  modifiedTime: "2026-10-01T10:00:00.000Z",
  ...extra,
});
const ID = (n: number) => `file_id_${String(n).padStart(4, "0")}`;
const res = (body: unknown, init: ResponseInit = {}) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), { status: 200, ...init });

describe("readEnv", () => {
  it("sem chave: not_configured (503)", () => {
    expect(() => readEnv({})).toThrowError(GalleryError);
    try {
      readEnv({ GOOGLE_DRIVE_API_KEY: "  " });
    } catch (e) {
      expect(e).toMatchObject({ code: "not_configured", status: 503 });
    }
  });
  it("pasta por omissão, limite e ordem configuráveis (com limites seguros)", () => {
    expect(readEnv({ GOOGLE_DRIVE_API_KEY: "k" })).toMatchObject({ folderId: DEFAULT_FOLDER_ID, max: 24, order: "name" });
    expect(readEnv({ ...env, GALLERY_MAX_IMAGES: "10", GALLERY_ORDER: "newest" })).toMatchObject({
      folderId: "FOLDER_ID_123456",
      max: 10,
      order: "newest",
    });
    expect(readEnv({ ...env, GALLERY_MAX_IMAGES: "9999" }).max).toBe(100);
    expect(readEnv({ ...env, GALLERY_MAX_IMAGES: "abc" }).max).toBe(24);
  });
});

describe("toGalleryImages", () => {
  it("só JPG/PNG/WebP: ignora pastas, documentos, GIF e ids inválidos", () => {
    const out = toGalleryImages(
      [
        f(ID(1), "a.jpg"),
        f(ID(2), "b.png", "image/png"),
        f(ID(3), "c.webp", "image/webp"),
        f(ID(4), "pasta", "application/vnd.google-apps.folder"),
        f(ID(5), "doc", "application/vnd.google-apps.document"),
        f(ID(6), "x.gif", "image/gif"),
        f(ID(7), "d.pdf", "application/pdf"),
        f("curto", "e.jpg"),
      ],
      { max: 50, order: "name" },
    );
    expect(out.map((i) => i.name)).toEqual(["a.jpg", "b.png", "c.webp"]);
  });
  it("ordena por nome natural (2 antes de 10) e limita", () => {
    const files = [f(ID(1), "10-promo.jpg"), f(ID(2), "2-promo.jpg"), f(ID(3), "1-promo.jpg")];
    expect(toGalleryImages(files, { max: 50, order: "name" }).map((i) => i.name)).toEqual(["1-promo.jpg", "2-promo.jpg", "10-promo.jpg"]);
    expect(toGalleryImages(files, { max: 2, order: "name" })).toHaveLength(2);
  });
  it("ordem 'newest' usa a data de modificação", () => {
    const files = [
      f(ID(1), "a.jpg", "image/jpeg", { modifiedTime: "2026-01-01T00:00:00Z" }),
      f(ID(2), "b.jpg", "image/jpeg", { modifiedTime: "2026-06-01T00:00:00Z" }),
    ];
    expect(toGalleryImages(files, { max: 5, order: "newest" }).map((i) => i.name)).toEqual(["b.jpg", "a.jpg"]);
  });
  it("URLs apontam para o proxy da função (nunca para links de partilha do Drive) e incluem srcSet e versão", () => {
    const [img] = toGalleryImages([f(ID(1), "Promo.jpg", "image/jpeg", { imageMediaMetadata: { width: 1080, height: 1350 } })], {
      max: 5,
      order: "name",
    });
    expect(img.src).toBe(`/api/gallery/image?id=${ID(1)}&v=20261001100000&w=960`);
    expect(img.srcSet).toContain("w=640");
    expect(img.srcSet).toContain("1280w");
    expect(img.full).toContain("w=1920");
    expect(JSON.stringify(img)).not.toMatch(/drive\.google|googleusercontent|key=/);
    expect(img).toMatchObject({ width: 1080, height: 1350 });
  });
  it("lista vazia", () => {
    expect(toGalleryImages([], { max: 5, order: "name" })).toEqual([]);
  });
});

describe("altFor / naturalCompare / clampWidth", () => {
  it("alt útil ou genérico", () => {
    expect(altFor("Promo-Visto_Estudo.png", 0)).toBe("Promo Visto Estudo");
    expect(altFor("IMG_2043.jpg", 2)).toBe("Publicação da Central de Agendamento (3)");
    expect(altFor("12.jpg", 0)).toBe("Publicação da Central de Agendamento (1)");
  });
  it("ordem natural", () => {
    expect(["b10", "b2", "a1"].sort(naturalCompare)).toEqual(["a1", "b2", "b10"]);
  });
  it("larguras permitidas", () => {
    expect(clampWidth(undefined)).toBe(960);
    expect(clampWidth(100)).toBe(320);
    expect(clampWidth(700)).toBe(960);
    expect(clampWidth(99999)).toBe(1920);
  });
});

describe("listImages", () => {
  it("consulta a pasta certa com filtro de imagens e devolve as imagens", async () => {
    const fetchMock = vi.fn(async () => res({ files: [f(ID(1), "a.jpg"), f(ID(2), "z", "application/vnd.google-apps.folder")] }));
    const out = await listImages(env, fetchMock as unknown as typeof fetch);
    expect(out).toHaveLength(1);
    const url = new URL((fetchMock.mock.calls[0] as unknown as [string])[0]);
    expect(url.origin + url.pathname).toBe("https://www.googleapis.com/drive/v3/files");
    expect(url.searchParams.get("key")).toBe(KEY);
    const q = url.searchParams.get("q") ?? "";
    expect(q).toContain("'FOLDER_ID_123456' in parents");
    expect(q).toContain("trashed=false");
    for (const m of ["image/jpeg", "image/png", "image/webp"]) expect(q).toContain(m);
    expect(url.searchParams.get("orderBy")).toBe("name_natural");
  });
  it("pasta vazia → lista vazia (não é erro)", async () => {
    await expect(listImages(env, (async () => res({ files: [] })) as unknown as typeof fetch)).resolves.toEqual([]);
  });
  it("erros do Google (403/404/rede/JSON inválido) → drive_error sem expor detalhes", async () => {
    for (const mk of [
      () => res("x", { status: 403 }),
      () => res("x", { status: 404 }),
      () => res("não é json"),
      () => res({ semFiles: true }),
    ]) {
      await expect(listImages(env, (async () => mk()) as unknown as typeof fetch)).rejects.toMatchObject({
        code: "drive_error",
        status: 502,
      });
    }
    await expect(
      listImages(env, (async () => {
        throw new Error(`rede key=${KEY}`);
      }) as unknown as typeof fetch),
    ).rejects.toMatchObject({ code: "drive_error", message: "drive_error" });
  });
  it("sem configuração → not_configured e nenhum pedido ao Google", async () => {
    const fetchMock = vi.fn();
    await expect(listImages({}, fetchMock as unknown as typeof fetch)).rejects.toMatchObject({ code: "not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("fetchImage", () => {
  const meta = {
    mimeType: "image/jpeg",
    parents: ["FOLDER_ID_123456"],
    thumbnailLink: "https://lh3.googleusercontent.com/drive-storage/abc=s220",
  };
  const img = () => new Response("BYTES", { status: 200, headers: { "content-type": "image/jpeg" } });
  it("usa o thumbnail redimensionado (pedido no momento) e valida que o ficheiro está na pasta", async () => {
    const calls: string[] = [];
    const fetchMock = vi.fn(async (u: string) => {
      calls.push(u);
      return u.includes("googleapis.com") ? res(meta) : img();
    });
    const r = await fetchImage(env, ID(1), 1000, fetchMock as unknown as typeof fetch);
    expect(await r.text()).toBe("BYTES");
    expect(calls[1]).toBe("https://lh3.googleusercontent.com/drive-storage/abc=w1280");
  });
  it("sem thumbnail, usa o ficheiro original (alt=media)", async () => {
    const fetchMock = vi.fn(async (u: string) => (u.includes("fields=") ? res({ ...meta, thumbnailLink: undefined }) : img()));
    await fetchImage(env, ID(1), 640, fetchMock as unknown as typeof fetch);
    expect((fetchMock.mock.calls[1] as unknown as [string])[0]).toContain("alt=media");
  });
  it("thumbnail a falhar → cai para o original", async () => {
    let n = 0;
    const fetchMock = vi.fn(async (u: string) => {
      n++;
      if (u.includes("fields=")) return res(meta);
      return u.includes("googleusercontent") ? res("x", { status: 403 }) : img();
    });
    await expect(fetchImage(env, ID(1), 640, fetchMock as unknown as typeof fetch)).resolves.toBeInstanceOf(Response);
    expect(n).toBe(3);
  });
  it("recusa ficheiros fora da pasta, não-imagens, ids inválidos e URLs de thumbnail estranhos", async () => {
    const other = vi.fn(async () => res({ ...meta, parents: ["OUTRA_PASTA_000"] }));
    await expect(fetchImage(env, ID(1), 640, other as unknown as typeof fetch)).rejects.toMatchObject({
      code: "forbidden_file",
      status: 404,
    });
    const pdf = vi.fn(async () => res({ ...meta, mimeType: "application/pdf" }));
    await expect(fetchImage(env, ID(1), 640, pdf as unknown as typeof fetch)).rejects.toMatchObject({ code: "forbidden_file" });
    await expect(fetchImage(env, "../../etc", 640, vi.fn() as unknown as typeof fetch)).rejects.toMatchObject({
      code: "bad_request",
      status: 400,
    });
    const evil = vi.fn(async (u: string) =>
      u.includes("fields=") ? res({ ...meta, thumbnailLink: "https://evil.example/x=s220" }) : img(),
    );
    await fetchImage(env, ID(1), 640, evil as unknown as typeof fetch);
    expect(evil.mock.calls.some((c) => String((c as unknown as [string])[0]).includes("evil.example"))).toBe(false);
  });
  it("404 do Google → forbidden_file; 5xx → drive_error", async () => {
    await expect(fetchImage(env, ID(1), 640, (async () => res("x", { status: 404 })) as unknown as typeof fetch)).rejects.toMatchObject({
      code: "forbidden_file",
    });
    await expect(fetchImage(env, ID(1), 640, (async () => res("x", { status: 500 })) as unknown as typeof fetch)).rejects.toMatchObject({
      code: "drive_error",
    });
  });
});
