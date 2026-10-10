import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type Route, test } from "@playwright/test";

const SIZES = [
  [1080, 1350],
  [1080, 1080],
  [1920, 1080],
  [1080, 1920],
] as const;
const BLUES = ["#101070", "#2350D9", "#1B3F9E", "#4A74E6"];

const svg = (w: number, h: number, i: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${BLUES[i % 4]}"/><text x="50%" y="50%" fill="#fff" font-size="${Math.round(w / 8)}" text-anchor="middle" font-family="sans-serif">Publicação ${i + 1}</text></svg>`;

const payload = (n: number) => ({
  images: Array.from({ length: n }, (_, i) => {
    const [width, height] = SIZES[i % SIZES.length];
    const id = `img_${String(i + 1).padStart(4, "0")}_abcdef`;
    return {
      id,
      alt: `Publicação ${i + 1}`,
      width,
      height,
      src: `/api/gallery/image?id=${id}&v=1&w=960`,
      srcSet: [640, 960, 1280].map((w) => `/api/gallery/image?id=${id}&v=1&w=${w} ${w}w`).join(", "),
      full: `/api/gallery/image?id=${id}&v=1&w=1920`,
    };
  }),
});

type Opts = { n?: number; delayMs?: number; status?: number; body?: unknown; imageStatus?: number };
async function mockGallery(page: Page, o: Opts = {}) {
  const hits = { list: 0, images: 0 };
  await page.route(/\/api\/gallery(\?.*)?$/, async (route: Route) => {
    hits.list++;
    if (o.delayMs) await new Promise((r) => setTimeout(r, o.delayMs));
    const body = o.body ?? payload(o.n ?? 8);
    await route.fulfill({ status: o.status ?? 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.route(/\/api\/gallery\/image/, async (route) => {
    hits.images++;
    if (o.imageStatus) return route.fulfill({ status: o.imageStatus, body: "x" });
    const u = new URL(route.request().url());
    const i = Number.parseInt(u.searchParams.get("id")?.slice(4, 8) ?? "1", 10) - 1;
    const [w, h] = SIZES[i % SIZES.length];
    await route.fulfill({ status: 200, contentType: "image/svg+xml", body: svg(w, h, i) });
  });
  return hits;
}

const gallery = (page: Page) => page.locator("#galeria");
const scroller = (page: Page) => page.locator("#galeria").getByRole("group", { name: /use as setas do teclado/ });

test.beforeEach(async ({ context }) => {
  await context.route("https://wa.me/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "ok" }));
});

test("skeleton enquanto carrega e depois o carrossel, com as imagens realmente carregadas", async ({ page }) => {
  await mockGallery(page, { delayMs: 1200 });
  await page.goto("/#galeria");
  await expect(gallery(page).getByRole("heading", { level: 2, name: "Galeria da Central de Agendamento" })).toBeVisible();
  await expect(gallery(page).getByText("Conheça um pouco mais do nosso trabalho e acompanhe as nossas publicações.")).toBeVisible();
  await expect(gallery(page).locator("[aria-busy='true'] .skeleton").first()).toBeVisible();
  await expect(gallery(page).getByRole("region", { name: "Galeria de imagens" })).toBeVisible();
  await expect(gallery(page).locator("[aria-busy='true']")).toHaveCount(0);
  const first = gallery(page).getByRole("img", { name: "Publicação 1", exact: true });
  await expect(first).toBeVisible();
  await expect.poll(() => first.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  expect(await first.getAttribute("srcset")).toContain("/api/gallery/image");
  await expect(gallery(page).getByRole("group", { name: /de 8$/ })).toHaveCount(8);
});

test("carregamento diferido: nem todas as imagens são pedidas de início; as restantes vêm ao navegar", async ({ page }) => {
  const hits = await mockGallery(page, { n: 16 });
  await page.goto("/#galeria");
  await expect(gallery(page).getByRole("img", { name: "Publicação 1", exact: true })).toBeVisible();
  await page.waitForTimeout(800);
  const initial = hits.images;
  expect(initial).toBeGreaterThan(0);
  expect(initial).toBeLessThan(16);
  await scroller(page).focus();
  await page.keyboard.press("End");
  await expect.poll(() => hits.images, { timeout: 8000 }).toBeGreaterThan(initial);
});

test("navegação: setas, teclado e indicador de posição", async ({ page, isMobile }) => {
  await mockGallery(page, { n: 6 });
  await page.goto("/#galeria");
  const region = gallery(page).getByRole("region", { name: "Galeria de imagens" });
  await expect(region).toBeVisible();
  const dot = (n: number) => region.getByRole("button", { name: `Ir para a imagem ${n}` });
  await expect(dot(1)).toHaveAttribute("aria-current", "true");
  if (isMobile) {
    // deslize horizontal (scroll-snap nativo)
    const step = await scroller(page).evaluate((el) => (el.firstElementChild as HTMLElement).offsetWidth + 16);
    await scroller(page).evaluate((el, s) => el.scrollTo({ left: s * 2, behavior: "instant" as ScrollBehavior }), step);
    await expect(dot(3)).toHaveAttribute("aria-current", "true");
    await region.getByRole("button", { name: "Imagem seguinte" }).last().click();
    await expect(dot(4)).toHaveAttribute("aria-current", "true");
  } else {
    await region.getByRole("button", { name: "Imagem seguinte" }).first().click();
    await expect(dot(2)).toHaveAttribute("aria-current", "true");
    await scroller(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(dot(3)).toHaveAttribute("aria-current", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(dot(2)).toHaveAttribute("aria-current", "true");
    await page.keyboard.press("Home");
    await expect(dot(1)).toHaveAttribute("aria-current", "true");
    await expect(region.getByRole("button", { name: "Imagem anterior" }).first()).toBeDisabled();
  }
});

test("mostra mais imagens em simultâneo em ecrãs largos e uma no telemóvel", async ({ page, isMobile }) => {
  await mockGallery(page, { n: 6 });
  await page.goto("/#galeria");
  await expect(gallery(page).getByRole("img", { name: "Publicação 1", exact: true })).toBeVisible();
  const visible = await scroller(page).evaluate((el) => {
    const box = el.getBoundingClientRect();
    return [...el.children].filter((c) => {
      const r = c.getBoundingClientRect();
      return r.left >= box.left - 2 && r.right <= box.right + 2;
    }).length;
  });
  expect(visible).toBe(isMobile ? 1 : 3);
});

test("imagens verticais, quadradas e horizontais: sem distorção e a horizontal aparece inteira", async ({ page }) => {
  await mockGallery(page, { n: 4 });
  await page.goto("/#galeria");
  await expect(gallery(page).getByRole("img", { name: "Publicação 1", exact: true })).toBeVisible();
  const fits = await gallery(page)
    .locator("img[alt^='Publicação']")
    .evaluateAll((els) => els.map((e) => ({ alt: (e as HTMLImageElement).alt, fit: getComputedStyle(e).objectFit })));
  expect(fits).toEqual([
    { alt: "Publicação 1", fit: "cover" }, // 4:5 encaixa na moldura
    { alt: "Publicação 2", fit: "contain" }, // quadrada: imagem inteira
    { alt: "Publicação 3", fit: "contain" }, // horizontal: imagem inteira
    { alt: "Publicação 4", fit: "contain" }, // vertical alta: imagem inteira
  ]);
});

test("ampliar: abre a imagem completa, navega, e fecha com Esc", async ({ page }) => {
  await mockGallery(page, { n: 4 });
  await page.goto("/#galeria");
  await gallery(page).getByRole("button", { name: "Ampliar imagem: Publicação 3" }).click();
  const dialog = page.getByRole("dialog", { name: "Imagem ampliada" });
  await expect(dialog).toBeVisible();
  const big = dialog.getByRole("img", { name: "Publicação 3" });
  await expect.poll(() => big.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  expect(await big.getAttribute("src")).toContain("w=1920");
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("img", { name: "Publicação 4" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("pasta vazia: mensagem discreta, sem erro", async ({ page }) => {
  await mockGallery(page, { body: { images: [] } });
  await page.goto("/#galeria");
  await expect(gallery(page).getByText(/Ainda não há publicações na galeria/)).toBeVisible();
  await expect(gallery(page).getByRole("link", { name: /Ver no Instagram/ })).toHaveAttribute("href", /instagram\.com/);
});

test("erro de acesso (API não configurada): mensagem discreta; 'Tentar novamente' recupera", async ({ page }) => {
  await mockGallery(page, { status: 503, body: { error: "not_configured" } });
  await page.goto("/#galeria");
  await expect(gallery(page).getByText(/Não foi possível carregar a galeria/)).toBeVisible();
  await expect(gallery(page).getByRole("heading", { level: 2 })).toBeVisible(); // a secção não fica em branco
  await page.unroute(/\/api\/gallery(\?.*)?$/);
  await mockGallery(page, { n: 3 });
  await gallery(page)
    .getByRole("button", { name: /Tentar novamente/ })
    .click();
  await expect(gallery(page).getByRole("region", { name: "Galeria de imagens" })).toBeVisible();
});

test("erro de rede: mensagem discreta", async ({ page }) => {
  await page.route(/\/api\/gallery(\?.*)?$/, (r) => r.abort("failed"));
  await page.goto("/#galeria");
  await expect(gallery(page).getByText(/Não foi possível carregar a galeria/)).toBeVisible();
});

test("imagem indisponível: mostra alternativa em vez de imagem partida", async ({ page }) => {
  await mockGallery(page, { n: 3, imageStatus: 404 });
  await page.goto("/#galeria");
  await expect(gallery(page).getByRole("img", { name: "Imagem indisponível" }).first()).toBeVisible();
});

test("cache local: segunda visita mostra logo as imagens guardadas, mesmo com a API em baixo", async ({ page }) => {
  await mockGallery(page, { n: 4 });
  await page.goto("/#galeria");
  await expect(gallery(page).getByRole("region", { name: "Galeria de imagens" })).toBeVisible();
  await page.unroute(/\/api\/gallery(\?.*)?$/);
  await page.route(/\/api\/gallery(\?.*)?$/, (r) =>
    r.fulfill({ status: 502, contentType: "application/json", body: '{"error":"drive_error"}' }),
  );
  await page.reload();
  await expect(gallery(page).getByRole("region", { name: "Galeria de imagens" })).toBeVisible();
  await expect(gallery(page).getByText(/Não foi possível carregar/)).toHaveCount(0);
});

test("sem scroll horizontal e sem vermelho em nenhum elemento da galeria", async ({ page }) => {
  await mockGallery(page, { n: 6 });
  await page.goto("/#galeria");
  await expect(gallery(page).getByRole("img", { name: "Publicação 1", exact: true })).toBeVisible();
  await page.waitForTimeout(700);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const reds = await gallery(page).evaluate((root) => {
    const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 4).map(Number);
    const isRed = (c: string) => {
      const [r, g, b, a = 1] = parse(c);
      return a > 0 && r > 150 && g < 90 && b < 90;
    };
    return [root, ...root.querySelectorAll("*")]
      .filter((el) => {
        const s = getComputedStyle(el);
        return [s.color, s.backgroundColor, s.borderTopColor, s.outlineColor].some((c) => isRed(c)) && !(el instanceof SVGElement);
      })
      .map((el) => el.tagName);
  });
  expect(reds).toEqual([]);
});

test("segurança: o browser só fala com /api/gallery (nunca com a API do Google nem com links do Drive)", async ({ page }) => {
  const urls: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  await mockGallery(page, { n: 4 });
  await page.goto("/#galeria");
  await expect(gallery(page).getByRole("img", { name: "Publicação 1", exact: true })).toBeVisible();
  const external = urls.filter((u) => /googleapis|drive\.google|googleusercontent|[?&]key=/i.test(u));
  expect(external).toEqual([]);
  const html = await page.content();
  expect(html).not.toMatch(/AIza[0-9A-Za-z_-]{30,}/);
});

test("acessibilidade (axe, WCAG A/AA) na galeria: carrossel, estado vazio e erro", async ({ page }) => {
  for (const o of [{ n: 5 }, { body: { images: [] } }, { status: 503, body: { error: "not_configured" } }] as Opts[]) {
    await page.unroute(/\/api\/gallery(\?.*)?$/).catch(() => {});
    await mockGallery(page, o);
    await page.goto("/#galeria");
    await page.waitForTimeout(1800);
    const { violations } = await new AxeBuilder({ page }).include("#galeria").withTags(["wcag2a", "wcag2aa"]).analyze();
    const grave = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      grave.map(
        (v) =>
          `${v.id}: ${v.nodes
            .slice(0, 3)
            .map((n) => n.target.join(" "))
            .join(" | ")}`,
      ),
    ).toEqual([]);
  }
});
