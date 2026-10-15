import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";

const KEY = "ca:theme";
const X = "https://x.com/central_de_";
const X_LABEL = "Visitar a Central de Agendamento no X";
const isDark = (page: Page) => page.evaluate(() => document.documentElement.classList.contains("dark"));
const toggle = (page: Page, name: "Activar modo escuro" | "Activar modo claro") =>
  page.getByRole("button", { name }).locator("visible=true").first();
const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const lum = (c: string) => {
  const [r, g, b] = (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const bg = (page: Page, sel: string) =>
  page
    .locator(sel)
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);

async function mountAll(page: Page) {
  for (let pass = 0; pass < 3; pass++) {
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 500) {
      await page.evaluate((t) => window.scrollTo(0, t), y);
      await page.waitForTimeout(70);
    }
  }
  await expect(page.locator("[aria-busy='true']")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900); // termina as animações de entrada antes de medir contraste
}

test.beforeEach(async ({ context }) => {
  await context.route("https://wa.me/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "ok" }));
});

test("alterna entre claro e escuro, com a descrição acessível certa, e guarda a preferência", async ({ page }) => {
  await page.goto("/");
  expect(await isDark(page)).toBe(false);
  const btn = toggle(page, "Activar modo escuro");
  await expect(btn).toBeVisible();
  await btn.click();
  expect(await isDark(page)).toBe(true);
  await expect(toggle(page, "Activar modo claro")).toBeVisible();
  expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe("dark");
  await page.waitForTimeout(450); // termina a transição suave de cores
  expect(lum(await bg(page, "body"))).toBeLessThan(0.02);
  await toggle(page, "Activar modo claro").click();
  expect(await isDark(page)).toBe(false);
  expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe("light");
  await page.waitForTimeout(450);
  expect(lum(await bg(page, "body"))).toBeGreaterThan(0.95);
});

test("a preferência mantém-se ao actualizar a página e noutras páginas (legais)", async ({ page }) => {
  await page.goto("/");
  await toggle(page, "Activar modo escuro").click();
  await page.reload();
  expect(await isDark(page)).toBe(true);
  await expect(toggle(page, "Activar modo claro")).toBeVisible();
  await page.goto("/politica-de-privacidade");
  expect(await isDark(page)).toBe(true);
  expect(lum(await bg(page, "body"))).toBeLessThan(0.02);
  await page.goto("/termos-e-condicoes");
  expect(await isDark(page)).toBe(true);
});

test("sem flash: o tema é aplicado antes de o JavaScript da aplicação carregar", async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, "dark"), KEY);
  await page.route(/\/assets\/index-.*\.js$/, async (route) => {
    await new Promise((r) => setTimeout(r, 1200)); // atrasa a app: só o script do <head> pode ter aplicado o tema
    await route.continue();
  });
  await page.goto("/", { waitUntil: "commit" });
  await expect.poll(() => isDark(page)).toBe(true);
  await expect(page.locator("#root .boot")).toBeVisible(); // ainda sem React
  expect(lum(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor))).toBeLessThan(0.02);
  expect(await page.evaluate(() => getComputedStyle(document.body).colorScheme)).toBe("dark");
});

test.describe("primeira visita", () => {
  test.use({ colorScheme: "dark" });
  test("respeita a preferência escura do sistema operativo", async ({ page }) => {
    await page.goto("/");
    expect(await isDark(page)).toBe(true);
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBeNull(); // ainda não escolheu
    await expect(toggle(page, "Activar modo claro")).toBeVisible();
  });
  test("a escolha guardada ganha ao sistema", async ({ page }) => {
    await page.addInitScript((k) => localStorage.setItem(k, "light"), KEY);
    await page.goto("/");
    expect(await isDark(page)).toBe(false);
  });
});

test("primeira visita com sistema claro → claro; e acompanha o sistema enquanto não houver escolha", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  expect(await isDark(page)).toBe(false);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => isDark(page)).toBe(true);
});

test("botão no cabeçalho em computador e telemóvel (alvo tocável) e menu móvel no tema escuro", async ({ page, isMobile }) => {
  await page.goto("/");
  const btn = toggle(page, "Activar modo escuro");
  const box = await btn.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(40);
  expect(box?.height).toBeGreaterThanOrEqual(40);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await btn.click();
  expect(await isDark(page)).toBe(true);
  await page.waitForTimeout(450);
  expect(lum(await bg(page, "header"))).toBeLessThan(0.1);
  if (isMobile) {
    await page.getByRole("button", { name: "Abrir menu" }).click();
    const menu = page.locator("#menu-mobile");
    await expect(menu).toBeVisible();
    expect(lum(await menu.evaluate((el) => getComputedStyle(el).backgroundColor))).toBeLessThan(0.1);
    await toggle(page, "Activar modo claro").click(); // o botão continua acessível com o menu aberto
    expect(await isDark(page)).toBe(false);
    await page.waitForTimeout(450);
    expect(lum(await menu.evaluate((el) => getComputedStyle(el).backgroundColor))).toBeGreaterThan(0.9);
  }
});

test("cada componente muda de claro para escuro (nada fica 'branco' no tema escuro)", async ({ page }) => {
  await page.goto("/");
  await mountAll(page);
  const surfaces = [
    "header",
    "#servicos article",
    "#precos button",
    "#pacotes article",
    "#galeria [role='group'] button",
    "#faq details, #faq > div > div > div",
    "#contactos form",
    "footer",
  ];
  const light: Record<string, number> = {};
  for (const s of surfaces) light[s] = lum(await bg(page, s));
  await toggle(page, "Activar modo escuro").click();
  await page.waitForTimeout(500);
  for (const s of surfaces) {
    const dark = lum(await bg(page, s));
    expect(dark, `${s}: escuro (${dark}) deve ser mais escuro que claro (${light[s]})`).toBeLessThanOrEqual(Math.min(light[s], 0.1));
  }
});

test("acessibilidade (axe, WCAG A/AA) nos DOIS modos, com todas as secções montadas", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await mountAll(page);
  for (const mode of ["claro", "escuro"] as const) {
    if (mode === "escuro") {
      await toggle(page, "Activar modo escuro").click();
      await page.waitForTimeout(600);
    }
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const grave = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      grave.map(
        (v) =>
          `[${mode}] ${v.id}: ${v.nodes
            .slice(0, 4)
            .map((n) => n.target.join(" "))
            .join(" | ")}`,
      ),
    ).toEqual([]);
  }
});

test("sem vermelho em NENHUM elemento, em nenhum dos modos", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await mountAll(page);
  const findReds = () =>
    page.evaluate(() => {
      const red = (c: string) => {
        const [r, g, b, a = 1] = (c.match(/[\d.]+/g) ?? []).map(Number);
        return a > 0 && r > 140 && r > g * 1.6 && r > b * 1.6;
      };
      return [...document.querySelectorAll("body *")]
        .filter((el) => {
          if (el instanceof HTMLImageElement) return false; // fotografias
          const s = getComputedStyle(el);
          return [s.color, s.backgroundColor, s.borderTopColor, s.borderBottomColor, s.outlineColor, s.fill, s.stroke].some(red);
        })
        .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`)
        .slice(0, 5);
    });
  expect(await findReds()).toEqual([]);
  await toggle(page, "Activar modo escuro").click();
  await page.waitForTimeout(500);
  expect(await findReds()).toEqual([]);
});

test("estados de foco visíveis e hover no tema escuro; botão do tema acessível por teclado", async ({ page, isMobile }) => {
  test.skip(isMobile, "teclado/hover: desktop");
  await page.goto("/");
  await toggle(page, "Activar modo escuro").click();
  const btn = toggle(page, "Activar modo claro");
  await page.keyboard.press("Shift"); // modalidade de teclado: o foco passa a ser :focus-visible
  await btn.focus();
  const outline = await btn.evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, color: getComputedStyle(el).outlineColor }));
  expect(outline.style).not.toBe("none");
  expect(lum(outline.color)).toBeGreaterThan(0.25); // anel de foco claro sobre fundo escuro
  await page.keyboard.press("Enter"); // activa pelo teclado
  expect(await isDark(page)).toBe(false);
  await page.keyboard.press("Space");
  expect(await isDark(page)).toBe(true);
  await btn.hover();
  await page.waitForTimeout(300);
  expect(await btn.evaluate((el) => getComputedStyle(el).borderColor)).not.toBe("");
});

test("galeria, ampliação e tabela de preços no tema escuro (visualizadores e molduras)", async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, "dark"), KEY);
  await page.goto("/#galeria");
  await expect(page.locator("#galeria").getByRole("img", { name: "01 vertical45", exact: true })).toBeVisible();
  await page
    .locator("#galeria")
    .getByRole("button", { name: /Ampliar imagem: 03/ })
    .click();
  const dialog = page.getByRole("dialog", { name: "Imagem ampliada" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Fechar" })).toBeVisible();
  await page.waitForTimeout(500);
  const lb = await new AxeBuilder({ page }).include("dialog").withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(lb.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
  await page.keyboard.press("Escape");
  await page.goto("/#precos");
  await expect(page.locator("#precos").getByRole("img", { name: /Tabela de preços/ })).toBeVisible();
  await page.waitForTimeout(900);
  const { violations } = await new AxeBuilder({ page }).include("#precos").withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
});

for (const path of ["/politica-de-privacidade", "/termos-e-condicoes"]) {
  test(`${path}: tema escuro legível (axe) e botão do tema no cabeçalho`, async ({ page }) => {
    await page.addInitScript((k) => localStorage.setItem(k, "dark"), KEY);
    await page.goto(path);
    await expect(toggle(page, "Activar modo claro")).toBeVisible();
    await page.waitForTimeout(1200);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(
      violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map(
          (v) =>
            `${v.id}: ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(" "))
              .join(" | ")}`,
        ),
    ).toEqual([]);
  });
}

test.describe("X nas redes sociais", () => {
  const checkX = async (link: Locator) => {
    await expect(link.first()).toHaveAttribute("href", X);
    await expect(link.first()).toHaveAttribute("target", "_blank");
    expect(await link.first().getAttribute("rel")).toMatch(/noopener/);
    expect(await link.first().getAttribute("rel")).toMatch(/noreferrer/);
  };
  test("secção de redes sociais, rodapé, contactos e páginas legais", async ({ page }) => {
    await page.goto("/#contactos");
    await expect(page.locator("#contactos").getByRole("link", { name: X_LABEL })).toBeVisible();
    await checkX(page.locator("#contactos").getByRole("link", { name: X_LABEL }));
    await checkX(page.getByRole("contentinfo").getByRole("link", { name: X_LABEL }));
    await mountAll(page);
    await checkX(page.locator("section", { hasText: "Acompanhe-nos nas redes sociais" }).getByRole("link", { name: X_LABEL }));
    await page.goto("/politica-de-privacidade#contacto");
    await checkX(page.locator("#contacto").getByRole("link", { name: X_LABEL }));
    await page.goto("/termos-e-condicoes");
    await checkX(page.getByRole("contentinfo").getByRole("link", { name: X_LABEL }));
  });
  test("Instagram, Facebook e TikTok continuam intactos e o X tem um ícone desenhado", async ({ page }) => {
    await page.goto("/#contactos");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // monta o rodapé (carregado sob demanda)
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/central_de_agendamento",
    );
    await expect(footer.getByRole("link", { name: "Facebook" })).toHaveAttribute("href", /facebook\.com/);
    await expect(footer.getByRole("link", { name: "TikTok" })).toHaveAttribute("href", "https://www.tiktok.com/@centraldeagendamento");
    await expect(page.locator("#contactos").getByRole("link", { name: X_LABEL }).locator("svg")).toBeVisible();
  });
  test("o link do X abre o perfil certo (pedido interceptado, sem sair do site de testes)", async ({ page, context }) => {
    await context.route("https://x.com/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "x" }));
    await page.goto("/#contactos");
    const popup = context.waitForEvent("page");
    await page.locator("#contactos").getByRole("link", { name: X_LABEL }).click();
    expect((await popup).url()).toBe(X);
  });
});
