import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LEGAL_LINKS, SITE, X_LABEL } from "../config/site";
import { applyTheme, getTheme, THEME_KEY } from "../lib/theme";
import Contact from "./Contact";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Social from "./Social";
import ThemeToggle from "./ThemeToggle";

beforeEach(() => {
  document.documentElement.className = "";
});
afterEach(() => applyTheme("light"));

describe("ThemeToggle", () => {
  it("modo claro: ícone de sol e descrição 'Activar modo escuro'; clicar alterna e guarda", async () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: "Activar modo escuro" });
    expect(btn.querySelector("svg")).toBeInTheDocument();
    expect(btn).toHaveAttribute("title", "Activar modo escuro");
    await userEvent.click(btn);
    expect(getTheme()).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(screen.getByRole("button", { name: "Activar modo claro" })).toBeInTheDocument(); // ícone de lua
    await userEvent.click(screen.getByRole("button", { name: "Activar modo claro" }));
    expect(getTheme()).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
  });
  it("sol e lua são ícones diferentes", async () => {
    render(<ThemeToggle />);
    const light = screen.getByRole("button").innerHTML;
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button").innerHTML).not.toBe(light);
  });
  it("arranca no modo escuro se o <html> já tiver a classe (script do <head>)", () => {
    applyTheme("dark");
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Activar modo claro" })).toBeInTheDocument();
  });
  it("na Navbar há um botão para desktop e outro para telemóvel, sempre sincronizados", async () => {
    render(<Navbar />);
    const buttons = screen.getAllByRole("button", { name: "Activar modo escuro" });
    expect(buttons).toHaveLength(2);
    await userEvent.click(buttons[0]);
    expect(screen.getAllByRole("button", { name: "Activar modo claro" })).toHaveLength(2);
  });
});

describe("X (Twitter) nas redes sociais", () => {
  it("URL oficial exacto", () => {
    expect(SITE.social.x.url).toBe("https://x.com/central_de_");
    expect(SITE.social.x.handle).toBe("@central_de_");
    expect(X_LABEL).toBe("Visitar a Central de Agendamento no X");
  });
  const check = (link: HTMLElement) => {
    expect(link).toHaveAttribute("href", "https://x.com/central_de_");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  };
  it("secção de redes sociais: 4 cartões e o link do X; Instagram, Facebook e TikTok intactos", () => {
    render(<Social />);
    check(screen.getByRole("link", { name: X_LABEL }));
    expect(screen.getAllByRole("link", { name: "Visitar perfil" })).toHaveLength(3);
    const hrefs = screen.getAllByRole("link").map((l) => l.getAttribute("href"));
    expect(hrefs).toEqual(
      expect.arrayContaining([SITE.social.instagram.url, SITE.social.facebook.url, SITE.social.tiktok.url, "https://x.com/central_de_"]),
    );
    expect(document.querySelectorAll("article")).toHaveLength(4);
  });
  it("rodapé: X junto às restantes redes e links legais intactos", () => {
    render(<Footer />);
    check(screen.getByRole("link", { name: X_LABEL }));
    for (const [label, href] of LEGAL_LINKS) expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute("href", SITE.social.instagram.url);
  });
  it("secção de contactos", () => {
    render(<Contact />);
    check(screen.getByRole("link", { name: X_LABEL }));
    expect(screen.getByRole("link", { name: /Instagram/ })).toHaveAttribute("href", SITE.social.instagram.url);
  });
});
