import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.doUnmock("virtual:price-table");
  vi.resetModules();
});

type P = { file: string; width?: number; height?: number } | null;
async function load(image: P) {
  vi.resetModules();
  vi.doMock("virtual:price-table", () => ({ default: image }));
  return (await import("./PriceTable")).default;
}

describe("PriceTable", () => {
  it("sem imagem em public/images → não mostra nada (nem título vazio nem imagem fictícia)", async () => {
    const PriceTable = await load(null);
    const { container } = render(<PriceTable />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra o título, o texto introdutório e a imagem original completa (sem cortes) com proporção reservada", async () => {
    const PriceTable = await load({ file: "tabela-precos.jpg", width: 900, height: 1200 });
    render(<PriceTable />);
    expect(screen.getByRole("heading", { level: 2, name: "Tabela de Preços" })).toBeInTheDocument();
    expect(screen.getByText(/Consulte a tabela com os valores dos nossos serviços/)).toBeInTheDocument();
    const img = screen.getByAltText("Tabela de preços dos serviços da Central de Agendamento");
    expect(img).toHaveAttribute("src", "/images/tabela-precos.jpg");
    expect(img).toHaveAttribute("width", "900");
    expect(img).toHaveAttribute("height", "1200");
    expect(img.className).toContain("object-contain"); // nunca cortada
    expect((img.closest("div") as HTMLElement).style.aspectRatio).toMatch(/^0\.75/);
    expect(document.querySelector("#precos table")).toBeNull(); // a tabela NÃO é reproduzida em HTML
  });

  it("clicar na imagem abre o visualizador ampliado, que se fecha com Esc/botão", async () => {
    const PriceTable = await load({ file: "tabela-precos.png", width: 800, height: 1000 });
    render(<PriceTable />);
    await userEvent.click(screen.getByRole("button", { name: "Ampliar a tabela de preços" }));
    const dialog = screen.getByRole("dialog", { name: "Imagem ampliada", hidden: true });
    expect(within(dialog).getByAltText(/Tabela de preços/)).toHaveAttribute("src", "/images/tabela-precos.png");
    expect(within(dialog).queryByRole("button", { name: /seguinte|anterior/, hidden: true })).toBeNull();
    await userEvent.click(within(dialog).getByRole("button", { name: "Fechar" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
  });

  it("links: WhatsApp e abrir a imagem original numa nova janela; imagem em falta mostra alternativa", async () => {
    const PriceTable = await load({ file: "tabela-precos.jpg" });
    render(<PriceTable />);
    expect(screen.getByRole("link", { name: /Falar connosco no WhatsApp/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/wa\.me\/\d+/),
    );
    const orig = screen.getByRole("link", { name: /Abrir imagem original/ });
    expect(orig).toHaveAttribute("href", "/images/tabela-precos.jpg");
    expect(orig).toHaveAttribute("target", "_blank");
    fireEvent.error(screen.getByAltText(/Tabela de preços/));
    expect(screen.getByRole("img", { name: "Tabela de preços indisponível" })).toBeInTheDocument();
  });
});
