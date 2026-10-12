import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** O build dos testes usa e2e/fixtures/tabela-precos.png (900×1200). Em produção é public/images/tabela-precos.jpg. */
const section = (page: import("@playwright/test").Page) => page.locator("#precos");

test("secção 'Tabela de Preços' com a imagem completa, sem cortes e sem tabela em HTML", async ({ page }) => {
  await page.goto("/#precos");
  await expect(section(page).getByRole("heading", { level: 2, name: "Tabela de Preços" })).toBeVisible();
  await expect(section(page).getByText(/Consulte a tabela com os valores dos nossos serviços/)).toBeVisible();
  const img = section(page).getByRole("img", { name: "Tabela de preços dos serviços da Central de Agendamento" });
  await expect(img).toBeVisible();
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  expect(await img.evaluate((i) => getComputedStyle(i).objectFit)).toBe("contain");
  // proporção original preservada (900×1200 = 0,75) e dentro do ecrã
  const box = await img.boundingBox();
  expect(Math.abs((box?.width ?? 0) / (box?.height ?? 1) - 0.75)).toBeLessThan(0.02);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(section(page).locator("table")).toHaveCount(0);
});

test("fica entre Serviços e Pacotes", async ({ page }) => {
  await page.goto("/#precos");
  await expect(section(page).getByRole("img", { name: /Tabela de preços/ })).toBeVisible();
  const order = await page.evaluate(() =>
    ["servicos", "precos", "pacotes"].map((id) => document.getElementById(id)?.getBoundingClientRect().top ?? -1),
  );
  expect(order[0]).toBeLessThan(order[1]);
  expect(order[1]).toBeLessThan(order[2]);
});

test("clicar na imagem abre o visualizador ampliado e fecha com Esc e com o botão", async ({ page }) => {
  await page.goto("/#precos");
  await section(page).getByRole("button", { name: "Ampliar a tabela de preços" }).click();
  const dialog = page.getByRole("dialog", { name: "Imagem ampliada" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("img", { name: /Tabela de preços/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await section(page).getByRole("button", { name: "Ampliar a tabela de preços" }).click();
  await dialog.getByRole("button", { name: "Fechar" }).click();
  await expect(dialog).toBeHidden();
});

test("links: abrir imagem original e WhatsApp", async ({ page }) => {
  await page.goto("/#precos");
  await expect(section(page).getByRole("link", { name: /Abrir imagem original/ })).toHaveAttribute("href", "/images/tabela-precos.png");
  await expect(section(page).getByRole("link", { name: /Falar connosco no WhatsApp/ })).toHaveAttribute("href", /wa\.me/);
});

test("acessibilidade (axe, WCAG A/AA) e sem vermelho", async ({ page }) => {
  await page.goto("/#precos");
  await expect(section(page).getByRole("img", { name: /Tabela de preços/ })).toBeVisible();
  await page.waitForTimeout(1500);
  const { violations } = await new AxeBuilder({ page }).include("#precos").withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
  const reds = await section(page).evaluate(
    (root) =>
      [root, ...root.querySelectorAll("*")].filter((el) => {
        const [r, g, b] = (getComputedStyle(el).backgroundColor.match(/[\d.]+/g) ?? []).map(Number);
        return r > 150 && g < 90 && b < 90;
      }).length,
  );
  expect(reds).toBe(0);
});
