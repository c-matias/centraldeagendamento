import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/** Percorre a página para montar todas as secções carregadas sob demanda. */
async function scrollThrough(page: Page) {
  for (let pass = 0; pass < 3; pass++) {
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 500) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(80);
    }
  }
  await expect(page.locator("[aria-busy='true']")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 0));
}

test.beforeEach(async ({ context, page }) => {
  // a API da galeria não existe no `vite preview`: responder com pasta vazia evita um 404 de consola nestes testes gerais
  await page.route(/\/api\/gallery(\?.*)?$/, (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"images":[]}' }));
  // nunca sair para o WhatsApp a sério durante os testes
  await context.route("https://wa.me/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "ok" }));
});

test("arranca sem erros e com o conteúdo principal", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/");
  await expect(page).toHaveTitle(/Central de Agendamento/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("processo de agendamento");
  await scrollThrough(page);
  expect(errors).toEqual([]);
});

test("mostra skeleton e só monta as secções ao aproximar-se", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#pacotes[aria-busy='true']")).toBeVisible();
  await expect(page.locator("#pacotes article")).toHaveCount(0);
  await page.locator("#pacotes").scrollIntoViewIfNeeded();
  await expect(page.locator("#pacotes article")).toHaveCount(5);
});

test("link directo /#pacotes aterra na secção", async ({ page }) => {
  await page.goto("/#pacotes");
  await expect(page.locator("#pacotes article")).toHaveCount(5);
  await expect.poll(async () => Math.round((await page.locator("#pacotes").boundingBox())?.y ?? 9999), { timeout: 5000 }).toBeLessThan(200);
});

test("pacotes: 5 cartões com WhatsApp e o nome do pacote", async ({ page }) => {
  await page.goto("/#pacotes");
  const links = page.locator("#pacotes a", { hasText: "Pedir este pacote" });
  await expect(links).toHaveCount(5);
  const hrefs = await links.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
  for (const [i, nome] of ["Essencial", "Seguro", "Agendamento", "Documentação", "Completo"].entries()) {
    expect(decodeURIComponent(hrefs[i])).toContain(`Pacote ${nome}`);
    expect(hrefs[i]).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  }
});

test("FAQ abre e fecha uma resposta", async ({ page }) => {
  await page.goto("/#faq");
  const first = page.locator("#faq button[aria-expanded]").first();
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "false");
});

test("formulário abre o WhatsApp com os dados preenchidos", async ({ page, context }) => {
  await page.goto("/#contactos");
  await page.getByLabel("Nome completo").fill("Maria Silva");
  await page.getByLabel("Número de telefone").fill("923000111");
  await page.getByLabel("Tipo de processo").selectOption("Visto de Estudo");
  const popup = context.waitForEvent("page");
  await page.getByRole("button", { name: /Solicitar atendimento/ }).click();
  const url = new URL((await popup).url());
  expect(url.hostname).toBe("wa.me");
  const text = url.searchParams.get("text") ?? "";
  expect(text).toContain("Maria Silva");
  expect(text).toContain("Visto de Estudo");
  await expect(page.getByRole("button", { name: /WhatsApp/ })).toBeVisible();
});

test("formulário não envia sem campos obrigatórios", async ({ page, context }) => {
  await page.goto("/#contactos");
  let opened = false;
  context.on("page", () => {
    opened = true;
  });
  await page.getByRole("button", { name: /Solicitar atendimento/ }).click();
  await page.waitForTimeout(400);
  expect(opened).toBe(false);
});

test("sem scroll horizontal", async ({ page }) => {
  await page.goto("/");
  await scrollThrough(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("menu mobile abre, navega e fecha", async ({ page, isMobile }) => {
  test.skip(!isMobile, "só em ecrãs pequenos");
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  const menu = page.locator("#menu-mobile");
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Pacotes" }).click();
  await expect(menu).toHaveCount(0);
  await expect(page.locator("#pacotes article")).toHaveCount(5);
});

test("teclado: o foco chega às secções carregadas sob demanda, sempre com foco visível", async ({ page, isMobile }) => {
  test.skip(isMobile, "teclado: desktop");
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForTimeout(400); // deixa a app ligar os seus listeners (um utilizador real nunca é tão rápido)
  await page.keyboard.press("Tab"); // o primeiro Tab monta todas as secções
  await expect(page.locator("#pacotes article")).toHaveCount(5);
  let reachedSection = false;
  for (let i = 0; i < 60 && !reachedSection; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return { outline: getComputedStyle(el).outlineStyle, inSection: !!el.closest("#servicos, #sobre, #pacotes"), tag: el.tagName };
    });
    if (info.tag !== "BODY") expect(info.outline).not.toBe("none");
    reachedSection = info.inSection;
  }
  expect(reachedSection).toBe(true);
});

test("reduzir movimento desliga o brilho dos skeletons", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", baseURL });
  const page = await context.newPage();
  await page.goto("/");
  const display = await page.evaluate(() => getComputedStyle(document.querySelector(".skeleton") as Element, "::after").display);
  expect(display).toBe("none");
  await context.close();
});

test("observabilidade desligada por omissão: nenhum pedido a fornecedores", async ({ page }) => {
  const vendors = /(sentry\.io|datadoghq|browser-intake|nr-data\.net|newrelic)/;
  const hits: string[] = [];
  page.on("request", (r) => vendors.test(r.url()) && hits.push(r.url()));
  await page.goto("/");
  await scrollThrough(page);
  expect(hits).toEqual([]);
});

test("acessibilidade (axe, WCAG A/AA): sem violações graves", async ({ page }) => {
  await page.goto("/");
  await scrollThrough(page);
  await page.waitForTimeout(1500); // deixa terminar as animações de entrada antes de medir contraste
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
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
