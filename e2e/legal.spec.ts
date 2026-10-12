import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  {
    path: "/politica-de-privacidade",
    h1: "Política de Privacidade",
    sub: "Como recolhemos, utilizamos e protegemos os seus dados.",
    sections: 12,
    cta: "Falar connosco",
  },
  {
    path: "/termos-e-condicoes",
    h1: "Termos e Condições",
    sub: "Condições de utilização do website e dos serviços da Central de Agendamento.",
    sections: 14,
    cta: "Entrar em contacto",
  },
];

test.beforeEach(async ({ context }) => {
  await context.route("https://wa.me/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "ok" }));
});

for (const p of PAGES) {
  test.describe(p.path, () => {
    test("abre pelo URL limpo, com título, H1 e subtítulo", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(p.path);
      await expect(page).toHaveTitle(new RegExp(p.h1));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.h1);
      await expect(page.getByText(p.sub)).toBeVisible();
      await expect(page.getByRole("heading", { level: 2 })).toHaveCount(p.sections);
      expect(errors).toEqual([]);
    });

    test("sem scroll horizontal e com footer legal em todas as páginas", async ({ page }) => {
      await page.goto(p.path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const legal = page.getByRole("navigation", { name: "Legal" });
      await expect(legal.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/politica-de-privacidade");
      await expect(legal.getByRole("link", { name: "Termos e Condições" })).toHaveAttribute("href", "/termos-e-condicoes");
      await expect(page.getByRole("link", { name: "Falar no WhatsApp" })).toBeVisible();
    });

    test("← Voltar ao início regressa à landing", async ({ page }) => {
      await page.goto(p.path);
      await page.getByRole("link", { name: /Voltar ao início/ }).click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("processo de agendamento");
    });

    test("índice leva à secção", async ({ page }) => {
      await page.goto(p.path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.waitForTimeout(800); // deixa terminar a animação de entrada do índice (sob carga, o clique podia cair a meio)
      await page.getByRole("navigation", { name: "Índice" }).getByRole("link").last().click();
      await expect(page).toHaveURL(/#contacto$/);
      await expect(page.locator("#contacto")).toBeInViewport();
      await expect(page.locator("#contacto").getByRole("link", { name: p.cta })).toHaveAttribute("href", /wa\.me/);
    });

    test("acessibilidade (axe, WCAG A/AA): sem violações graves", async ({ page }) => {
      await page.goto(p.path);
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1500);
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
  });
}

test("Termos mostram os dois placeholders por preencher", async ({ page }) => {
  await page.goto("/termos-e-condicoes");
  await expect(page.getByText("[INSERIR MÉTODOS DE PAGAMENTO UTILIZADOS PELA EMPRESA]")).toBeVisible();
  await expect(page.getByText("[INSERIR POLÍTICA DE CANCELAMENTO E REEMBOLSO DA EMPRESA]")).toBeVisible();
});

test("a landing liga às duas páginas pelo footer", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const link = page.getByRole("navigation", { name: "Legal" }).getByRole("link", { name: "Política de Privacidade" });
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page).toHaveURL(/\/politica-de-privacidade$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Política de Privacidade");
});

test("menu mobile numa página jurídica navega para a secção da landing", async ({ page, isMobile }) => {
  test.skip(!isMobile, "só em ecrãs pequenos");
  await page.goto("/termos-e-condicoes");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.locator("#menu-mobile").getByRole("link", { name: "Pacotes" }).click();
  await expect(page).toHaveURL(/\/#pacotes$/);
  await expect(page.locator("#pacotes article")).toHaveCount(5);
});
