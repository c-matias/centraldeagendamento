import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { LEGAL_REVIEW_NOTICE, PRIVACY, PRIVACY_UPDATED, TERMS, TERMS_UPDATED } from "../config/legal";
import { LEGAL_LINKS, SITE } from "../config/site";
import PrivacyPage from "./PrivacyPage";
import TermsPage from "./TermsPage";

const textOf = (doc: typeof PRIVACY) =>
  doc.sections
    .flatMap((s) => s.blocks)
    .map((b) => ("text" in b ? b.text : "items" in b ? b.items.join(" ") : ""))
    .join(" ");

describe.each([
  ["Política de Privacidade", PrivacyPage, PRIVACY, PRIVACY_UPDATED, "Falar connosco", 12],
  ["Termos e Condições", TermsPage, TERMS, TERMS_UPDATED, "Entrar em contacto", 14],
] as const)("%s", (title, Page, doc, updated, cta, nSections) => {
  it("tem H1, subtítulo, voltar ao início e a data editável", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(title);
    expect(screen.getByText(doc.subtitle)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Voltar ao início/ })).toHaveAttribute("href", "/");
    expect(document.querySelector("[data-updated]")).toHaveTextContent(`${updated}`);
    expect(screen.getAllByText(/Última actualização/).length).toBeGreaterThanOrEqual(2);
  });
  it(`tem ${nSections} secções, cada uma com H2 e entrada no índice`, () => {
    render(<Page />);
    expect(doc.sections).toHaveLength(nSections);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(nSections);
    const toc = within(screen.getByRole("navigation", { name: "Índice" }));
    for (const s of doc.sections) {
      expect(toc.getByRole("link", { name: new RegExp(s.title) })).toHaveAttribute("href", `#${s.id}`);
      expect(document.getElementById(s.id)).not.toBeNull();
    }
    expect(new Set(doc.sections.map((s) => s.id)).size).toBe(nSections);
  });
  it("contactos oficiais e botão de contacto", () => {
    render(<Page />);
    expect(screen.getAllByRole("link", { name: (n) => n.includes(SITE.phoneLabel) }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(SITE.social.instagram.handle).length).toBeGreaterThan(0);
    expect(screen.getAllByText(SITE.social.facebook.handle).length).toBeGreaterThan(0);
    expect(screen.getAllByText(SITE.social.tiktok.handle).length).toBeGreaterThan(0);
    const button = screen.getAllByRole("link", { name: cta })[0];
    expect(button.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/\d+/);
  });
  it("mesma navbar (âncoras para a landing), footer com links legais e botão de WhatsApp", () => {
    render(<Page />);
    expect(screen.getAllByRole("link", { name: "Pacotes" })[0]).toHaveAttribute("href", "/#pacotes");
    const legal = within(screen.getByRole("navigation", { name: "Legal" }));
    for (const [label, href] of LEGAL_LINKS) expect(legal.getByRole("link", { name: label })).toHaveAttribute("href", href);
    expect(screen.getByRole("link", { name: "Falar no WhatsApp" })).toBeInTheDocument();
    expect(screen.getAllByText(/não representa o Consulado de Portugal/).length).toBeGreaterThan(0);
  });
  it("aviso de revisão visível enquanto a flag estiver activa", () => {
    render(<Page />);
    if (LEGAL_REVIEW_NOTICE) expect(screen.getByRole("note")).toBeInTheDocument();
    else expect(screen.queryByRole("note")).toBeNull();
  });
});

describe("conteúdo jurídico: nada inventado", () => {
  it("Termos: cláusulas essenciais e placeholders para o que a empresa ainda não definiu", () => {
    const t = textOf(TERMS);
    expect(t).toContain("não garante a aprovação de qualquer pedido de visto");
    expect(t).toContain("não é uma entidade governamental, não representa o Consulado de Portugal");
    expect(t).toContain("pertence exclusivamente às autoridades competentes");
    render(<TermsPage />);
    const ph = [...document.querySelectorAll("[data-placeholder]")].map((e) => e.textContent);
    expect(ph).toEqual([
      "[INSERIR MÉTODOS DE PAGAMENTO UTILIZADOS PELA EMPRESA]",
      "[INSERIR POLÍTICA DE CANCELAMENTO E REEMBOLSO DA EMPRESA]",
    ]);
    expect(t).not.toMatch(/\d+\s?(Kz|AOA|€|EUR|USD)/i); // sem preços
  });
  it("Privacidade: dados não vendidos, sem fornecedores, leis, prazos ou entidades inventados", () => {
    const t = textOf(PRIVACY);
    expect(t).toContain("Os dados pessoais não são vendidos");
    expect(t).toContain("canais oficiais");
    expect(t).not.toMatch(/Google Analytics|Facebook Pixel|Meta Pixel|Hotjar|Netlify|Sentry|Datadog|New Relic|Cloudflare/i);
    expect(t).not.toMatch(/\b(Lei|Decreto|RGPD|GDPR|LGPD|artigo)\b/i);
    expect(t).not.toMatch(/\b\d+\s+(dias|meses|anos)\b/i);
    expect(t).toMatch(/WhatsApp/);
  });
  it("Cookies: distingue os quatro tipos e deixa a confirmação à empresa", () => {
    const cookies = PRIVACY.sections.find((s) => s.id === "cookies");
    const all = JSON.stringify(cookies);
    for (const k of ["necessários", "preferência", "analíticos", "terceiros"]) expect(all).toContain(k);
    expect(all).toContain("[CONFIRMAR COM A EMPRESA");
  });
});

describe("Navbar/Footer na landing continuam com âncoras locais", () => {
  it("sem basePath", () => {
    render(
      <>
        <Navbar />
        <Footer />
      </>,
    );
    expect(screen.getAllByRole("link", { name: "Serviços" })[0]).toHaveAttribute("href", "#servicos");
    expect(within(screen.getByRole("navigation", { name: "Legal" })).getAllByRole("link")).toHaveLength(2);
  });
});
