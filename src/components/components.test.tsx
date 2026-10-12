import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { intersectAll } from "../../tests/setup";
import { FAQ, PACKAGES, SITE, TESTIMONIALS } from "../config/site";
import { __registerForTests, __resetForTests } from "../observability";
import Contact from "./Contact";
import { __resetDeferredForTests } from "./Deferred";
import ErrorBoundary from "./ErrorBoundary";
import Faq from "./Faq";
import Navbar from "./Navbar";
import Packages from "./Packages";
import Testimonials from "./Testimonials";

afterEach(() => __resetForTests());

describe("Faq", () => {
  it("mostra 6 perguntas e expande para todas", async () => {
    render(<Faq />);
    expect(screen.getAllByRole("button", { expanded: false }).filter((b) => FAQ.some(([q]) => b.textContent?.startsWith(q)))).toHaveLength(
      6,
    );
    await userEvent.click(screen.getByRole("button", { name: /Ver todas as perguntas/ }));
    expect(screen.getByRole("button", { name: /Ver menos perguntas/ })).toBeInTheDocument();
    expect(screen.getByText(FAQ.at(-1)?.[0] ?? "")).toBeInTheDocument();
  });
  it("acordeão alterna aria-expanded", async () => {
    render(<Faq />);
    const first = screen.getAllByRole("button").find((b) => b.textContent === FAQ[0][0]) as HTMLElement;
    expect(first).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
  });
});

describe("Packages", () => {
  it("renderiza os 5 pacotes com CTA de WhatsApp com o nome do pacote", () => {
    render(<Packages />);
    const links = screen.getAllByRole("link", { name: "Pedir este pacote" });
    expect(links).toHaveLength(PACKAGES.length);
    PACKAGES.forEach((p, i) => {
      const text = new URL(links[i].getAttribute("href") ?? "").searchParams.get("text");
      expect(text).toContain(p.name);
    });
    for (const p of PACKAGES) expect(screen.getByText(p.price)).toBeInTheDocument();
    expect(screen.queryByText(/consulte-nos/i)).toBeNull();
  });
  it("só o Completo tem selo", () => {
    render(<Packages />);
    expect(screen.getAllByText("Todos os serviços")).toHaveLength(1);
  });
});

describe("Navbar", () => {
  it("abre e fecha o menu mobile (botão e Escape)", async () => {
    render(<Navbar />);
    const btn = screen.getByRole("button", { name: "Abrir menu" });
    await userEvent.click(btn);
    expect(screen.getByRole("button", { name: "Fechar menu" })).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("menu-mobile")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(document.getElementById("menu-mobile")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Testimonials", () => {
  it("navega e só marca placeholders com [ ]", async () => {
    render(<Testimonials />);
    expect(screen.getByText(`1 / ${TESTIMONIALS.length}`)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Próximo testemunho" }));
    expect(screen.getByText(`2 / ${TESTIMONIALS.length}`)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Testemunho anterior" }));
    expect(screen.getByText(`1 / ${TESTIMONIALS.length}`)).toBeInTheDocument();
    const placeholders = screen.queryAllByText("Exemplo / placeholder").length;
    expect(placeholders).toBe(TESTIMONIALS[0].name.startsWith("[") ? 1 : 0);
  });
});

describe("Contact", () => {
  it("lista o email e o telefone com links válidos", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: new RegExp(SITE.email) })).toHaveAttribute("href", `mailto:${SITE.email}`);
    expect(screen.getByRole("link", { name: /Telefone/ })).toHaveAttribute("href", `tel:${SITE.phone}`);
  });
  it("envia para o WhatsApp com os dados (sem PII na telemetria)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const tracker = { captureError: vi.fn(), track: vi.fn() };
    __registerForTests(tracker);
    render(<Contact />);
    const form = within(document.querySelector("form") as HTMLElement);
    fireEvent.change(form.getByLabelText("Nome completo"), { target: { value: "Maria Silva" } });
    fireEvent.change(form.getByLabelText("Número de telefone"), { target: { value: "923000111" } });
    fireEvent.change(form.getByLabelText("Tipo de processo"), { target: { value: "Visto de Estudo" } });
    fireEvent.change(form.getByLabelText("Mensagem"), { target: { value: "Preciso de ajuda" } });
    fireEvent.click(form.getByRole("button", { name: /Solicitar atendimento/ }));
    expect(open).toHaveBeenCalledOnce();
    const url = new URL(String(open.mock.calls[0][0]));
    const text = url.searchParams.get("text") ?? "";
    expect(url.hostname).toBe("wa.me");
    expect(text).toContain("Maria Silva");
    expect(text).toContain("Visto de Estudo");
    expect(text).toContain("Preciso de ajuda");
    // telemetria: só o tipo de processo; nunca nome, telefone ou mensagem
    expect(tracker.track).toHaveBeenCalledWith("form_submit", { tipo: "Visto de Estudo" });
    expect(JSON.stringify(tracker.track.mock.calls)).not.toMatch(/Maria|923000111|Preciso/);
    await vi.waitFor(() => expect(form.getByRole("button")).toHaveTextContent("A abrir o WhatsApp"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });
    await vi.waitFor(() => expect(form.getByRole("button")).toHaveTextContent("Pronto"));
    open.mockRestore();
  });
  it("não envia com campos obrigatórios vazios", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    render(<Contact />);
    const form = document.querySelector("form") as HTMLFormElement;
    expect(form.checkValidity()).toBe(false);
    open.mockRestore();
  });
});

describe("ErrorBoundary", () => {
  it("mostra alternativa e regista o erro", () => {
    const tracker = { captureError: vi.fn(), track: vi.fn() };
    __registerForTests(tracker);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const Bomb = () => {
      throw new Error("falhou");
    };
    render(
      <ErrorBoundary label="teste">
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/Ocorreu um problema/);
    expect(tracker.captureError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "falhou" }),
      expect.objectContaining({ boundary: "teste" }),
    );
  });
});

describe("regras de marca", () => {
  it("não há classes Tailwind vermelhas no código", async () => {
    const files = import.meta.glob("../**/*.{ts,tsx,css}", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
    const offenders = Object.entries(files)
      .filter(([f]) => !f.endsWith(".test.tsx") && !f.endsWith(".test.ts"))
      .filter(([, src]) =>
        /\b(?:bg|text|border|ring|from|to|via|fill|stroke|outline|decoration|shadow)-(?:red|rose|pink)-\d{2,3}\b/.test(src),
      )
      .map(([f]) => f);
    expect(offenders).toEqual([]);
  });
});

describe("App (carregamento sob demanda)", () => {
  it("mostra skeletons e monta as secções quando entram no ecrã", async () => {
    const { default: App } = await import("../App");
    render(<App />);
    expect(document.querySelectorAll("[aria-busy='true']").length).toBeGreaterThan(0);
    expect(document.querySelector("#pacotes article")).toBeNull();
    await act(async () => intersectAll());
    await vi.waitFor(() => expect(document.querySelector("#pacotes article")).not.toBeNull(), { timeout: 5000 });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/processo de agendamento/);
  });
});

describe("Deferred (teclado)", () => {
  it("o primeiro Tab monta todas as secções para o foco as alcançar", async () => {
    __resetDeferredForTests();
    const { default: App } = await import("../App");
    render(<App />);
    expect(document.querySelector("#pacotes article")).toBeNull();
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    });
    await vi.waitFor(() => expect(document.querySelector("#pacotes article")).not.toBeNull(), { timeout: 5000 });
    expect(document.querySelector("#faq")).not.toBeNull();
  });
});
