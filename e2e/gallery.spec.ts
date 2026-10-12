import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/** O build dos testes usa e2e/fixtures/carousel (16 imagens: 4:5, quadradas, horizontais e verticais altas) — nunca as imagens reais do site. */
const gallery = (page: Page) => page.locator("#galeria");
const scroller = (page: Page) => gallery(page).getByRole("group", { name: /use as setas do teclado/ });
const first = (page: Page) => gallery(page).getByRole("img", { name: "01 vertical45", exact: true });

test.beforeEach(async ({ context }) => {
  await context.route("https://wa.me/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "ok" }));
});

test("galeria com título, subtítulo e imagens locais realmente carregadas (sem API)", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => /\/api\/|googleapis|drive\.google|googleusercontent/i.test(r.url()) && external.push(r.url()));
  await page.goto("/#galeria");
  await expect(gallery(page).getByRole("heading", { level: 2, name: "Galeria da Central de Agendamento" })).toBeVisible();
  await expect(gallery(page).getByText("Conheça um pouco mais do nosso trabalho e acompanhe as nossas publicações.")).toBeVisible();
  await expect(gallery(page).getByRole("region", { name: "Galeria de imagens" })).toBeVisible();
  await expect(first(page)).toBeVisible();
  await expect.poll(() => first(page).evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  expect(await first(page).getAttribute("src")).toBe("/images/carousel/01-vertical45.png");
  await expect(gallery(page).getByRole("group", { name: /de 16$/ })).toHaveCount(16);
  expect(external).toEqual([]);
});

test("carregamento diferido: nem todas as imagens são pedidas de início; as restantes vêm ao navegar", async ({ page }) => {
  const requested = new Set<string>();
  page.on("request", (r) => r.url().includes("/images/carousel/") && requested.add(r.url()));
  await page.goto("/#galeria");
  await expect(first(page)).toBeVisible();
  await page.waitForTimeout(800);
  const initial = requested.size;
  expect(initial).toBeGreaterThan(0);
  expect(initial).toBeLessThan(32); // 16 imagens + 16 fundos desfocados no pior caso: nem todas
  await scroller(page).focus();
  await page.keyboard.press("End");
  await expect.poll(() => requested.size, { timeout: 8000 }).toBeGreaterThan(initial);
});

test("navegação: setas, teclado e indicador de posição", async ({ page, isMobile }) => {
  await page.goto("/#galeria");
  const region = gallery(page).getByRole("region", { name: "Galeria de imagens" });
  await expect(region).toBeVisible();
  const counter = region.getByText(/^\d+ \/ \d+$/);
  await expect(counter).toHaveText(/^1 \/ \d+$/);
  if (isMobile) {
    const step = await scroller(page).evaluate((el) => (el.firstElementChild as HTMLElement).offsetWidth + 16);
    await scroller(page).evaluate((el, s) => el.scrollTo({ left: s * 2, behavior: "instant" as ScrollBehavior }), step);
    await expect(counter).toHaveText(/^3 \/ \d+$/);
    await region.getByRole("button", { name: "Imagem seguinte" }).last().click();
    await expect(counter).toHaveText(/^4 \/ \d+$/);
  } else {
    await region.getByRole("button", { name: "Imagem seguinte" }).first().click();
    await expect(counter).toHaveText(/^2 \/ \d+$/);
    await scroller(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(counter).toHaveText(/^3 \/ \d+$/);
    await page.keyboard.press("ArrowLeft");
    await expect(counter).toHaveText(/^2 \/ \d+$/);
    await page.keyboard.press("Home");
    await expect(counter).toHaveText(/^1 \/ \d+$/);
    await expect(region.getByRole("button", { name: "Imagem anterior" }).first()).toBeDisabled();
  }
});

test("mostra 3 imagens em simultâneo em ecrãs largos e 1 no telemóvel", async ({ page, isMobile }) => {
  await page.goto("/#galeria");
  await expect(first(page)).toBeVisible();
  const visible = await scroller(page).evaluate((el) => {
    const box = el.getBoundingClientRect();
    return [...el.children].filter((c) => {
      const r = c.getBoundingClientRect();
      return r.left >= box.left - 2 && r.right <= box.right + 2;
    }).length;
  });
  expect(visible).toBe(isMobile ? 1 : 3);
});

test("imagens verticais, quadradas e horizontais: sem distorção; só as 4:5 preenchem, as outras aparecem inteiras", async ({ page }) => {
  await page.goto("/#galeria");
  await expect(first(page)).toBeVisible();
  const fits = await gallery(page)
    .locator("img[alt^='0']")
    .evaluateAll((els) => els.slice(0, 4).map((e) => ({ alt: (e as HTMLImageElement).alt, fit: getComputedStyle(e).objectFit })));
  expect(fits).toEqual([
    { alt: "01 vertical45", fit: "cover" },
    { alt: "02 quadrada", fit: "contain" },
    { alt: "03 horizontal", fit: "contain" },
    { alt: "04 vertical916", fit: "contain" },
  ]);
});

test("ampliar: abre a imagem completa, navega e fecha com Esc", async ({ page }) => {
  await page.goto("/#galeria");
  await gallery(page).getByRole("button", { name: "Ampliar imagem: 03 horizontal" }).click();
  const dialog = page.getByRole("dialog", { name: "Imagem ampliada" });
  await expect(dialog).toBeVisible();
  const big = dialog.getByRole("img", { name: "03 horizontal" });
  await expect.poll(() => big.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("img", { name: "04 vertical916" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("imagem em falta (404): mostra alternativa em vez de imagem partida", async ({ page }) => {
  await page.route(/\/images\/carousel\/01-vertical45\.png/, (r) => r.fulfill({ status: 404, body: "x" }));
  await page.goto("/#galeria");
  await expect(gallery(page).getByRole("img", { name: "Imagem indisponível" }).first()).toBeVisible();
});

test("sem scroll horizontal e sem vermelho em nenhum elemento da galeria", async ({ page }) => {
  await page.goto("/#galeria");
  await expect(first(page)).toBeVisible();
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

test("acessibilidade (axe, WCAG A/AA) na galeria", async ({ page }) => {
  await page.goto("/#galeria");
  await expect(first(page)).toBeVisible();
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
});
