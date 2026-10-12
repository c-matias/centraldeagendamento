import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { __resetForTests } from "../observability";
import Carousel from "./Carousel";
import Lightbox from "./Lightbox";
import { LazyImage } from "./media";

afterEach(() => {
  __resetForTests();
  vi.doUnmock("virtual:carousel-images");
  vi.resetModules();
});

type F = { file: string; width?: number; height?: number };
const files = (n: number): F[] =>
  Array.from({ length: n }, (_, i) => ({
    file: `${String(i + 1).padStart(2, "0")}-publicacao.jpg`,
    width: i % 2 ? 1920 : 1080,
    height: i % 2 ? 1080 : 1350,
  }));

/** A galeria lê a lista do módulo virtual (descoberta no build): para testar listas diferentes, recarrega-se o módulo. */
async function loadGallery(list: F[]) {
  vi.resetModules();
  vi.doMock("virtual:carousel-images", () => ({ default: list }));
  return (await import("./Gallery")).default;
}

describe("Gallery (imagens locais de public/images/carousel/)", () => {
  it("título e subtítulo pedidos; imagens vêm de /images/carousel/ e nunca da rede (sem API)", async () => {
    const Gallery = await loadGallery(files(4));
    render(<Gallery />);
    expect(screen.getByRole("heading", { level: 2, name: "Galeria da Central de Agendamento" })).toBeInTheDocument();
    expect(screen.getByText("Conheça um pouco mais do nosso trabalho e acompanhe as nossas publicações.")).toBeInTheDocument();
    const region = screen.getByRole("region", { name: "Galeria de imagens" });
    const slides = within(region).getAllByRole("group", { name: /de 4$/ });
    expect(slides).toHaveLength(4);
    const imgs = within(region)
      .getAllByRole("img")
      .filter((i) => i.getAttribute("src")?.startsWith("/images/carousel/"));
    expect(imgs.length).toBeGreaterThanOrEqual(4);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("slides com skeleton até a imagem carregar, lazy-loading, e imagem inteira (contain) para horizontais", async () => {
    const Gallery = await loadGallery(files(4));
    render(<Gallery />);
    const region = screen.getByRole("region", { name: "Galeria de imagens" });
    const slides = within(region).getAllByRole("group", { name: /de 4$/ });
    expect(document.querySelectorAll(".skeleton").length).toBeGreaterThan(0);
    const img1 = within(slides[0]).getByAltText("01 publicacao");
    expect(img1).toHaveAttribute("loading", "lazy");
    expect(img1.className).not.toContain("object-contain"); // 4:5 → cover
    expect(within(slides[1]).getByAltText("02 publicacao").className).toContain("object-contain"); // 16:9 → imagem inteira
    fireEvent.load(img1);
    expect(img1.className).toContain("opacity-100");
    expect(screen.getByRole("link", { name: /Ver no Instagram/ })).toHaveAttribute("href", expect.stringContaining("instagram.com"));
  });

  it("pasta sem imagens → mensagem discreta, sem carrossel nem erros", async () => {
    const Gallery = await loadGallery([]);
    render(<Gallery />);
    expect(screen.getByText(/Ainda não há publicações na galeria/)).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Galeria de imagens" })).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("imagem em falta/partida → alternativa 'Imagem indisponível' (não fica imagem partida)", async () => {
    const Gallery = await loadGallery(files(2));
    render(<Gallery />);
    fireEvent.error(screen.getByAltText("01 publicacao"));
    expect(screen.getAllByRole("img", { name: "Imagem indisponível" }).length).toBe(1);
  });

  it("respeita o limite de imagens e ordem recebida", async () => {
    const Gallery = await loadGallery(files(40));
    render(<Gallery />);
    expect(within(screen.getByRole("region", { name: "Galeria de imagens" })).getAllByRole("group", { name: /de 24$/ })).toHaveLength(24);
  });

  it("ampliar: abre a imagem completa, navega com setas e fecha com o botão; regista eventos sem dados pessoais", async () => {
    const tracker = { captureError: vi.fn(), track: vi.fn() };
    const Gallery = await loadGallery(files(3));
    const obs = await import("../observability"); // mesma instância que a Gallery (depois do resetModules)
    obs.__registerForTests(tracker);
    render(<Gallery />);
    await userEvent.click(screen.getByRole("button", { name: "Ampliar imagem: 01 publicacao" }));
    const dialog = screen.getByRole("dialog", { name: "Imagem ampliada", hidden: true });
    expect(within(dialog).getByAltText("01 publicacao")).toHaveAttribute("src", "/images/carousel/01-publicacao.jpg");
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByAltText("02 publicacao")).toBeInTheDocument();
    expect(within(dialog).getByText("2 / 3")).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(within(dialog).getByAltText("03 publicacao")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Fechar" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(tracker.track).toHaveBeenCalledWith("gallery_open", undefined);
    expect(JSON.stringify(tracker.track.mock.calls)).not.toMatch(/publicacao/);
  });
});

describe("Carousel", () => {
  const slides = (n: number) => Array.from({ length: n }, (_, i) => <p key={`s${i}`}>Slide {i + 1}</p>);
  const mockScroll = (el: HTMLElement) => {
    Object.defineProperty(el.firstElementChild as HTMLElement, "offsetWidth", { value: 300, configurable: true });
    el.scrollTo = vi.fn(({ left }: ScrollToOptions) => {
      el.scrollLeft = left ?? 0;
    }) as unknown as typeof el.scrollTo;
  };

  it("teclado: ← → Home End; setas desactivadas nos extremos; indicadores com aria-current", async () => {
    render(<Carousel slides={slides(5)} label="Teste" />);
    const scroller = screen.getByRole("group", { name: /use as setas do teclado/ });
    mockScroll(scroller);
    const prev = screen.getAllByRole("button", { name: "Imagem anterior" });
    const next = screen.getAllByRole("button", { name: "Imagem seguinte" });
    expect(prev.every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
    fireEvent.keyDown(scroller, { key: "ArrowRight" });
    expect(scroller.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 316 }));
    expect(screen.getByRole("button", { name: "Ir para a imagem 2" })).toHaveAttribute("aria-current", "true");
    fireEvent.keyDown(scroller, { key: "End" });
    expect(screen.getByRole("button", { name: "Ir para a imagem 5" })).toHaveAttribute("aria-current", "true");
    expect(next.every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
    fireEvent.keyDown(scroller, { key: "Home" });
    expect(screen.getByRole("button", { name: "Ir para a imagem 1" })).toHaveAttribute("aria-current", "true");
    fireEvent.keyDown(scroller, { key: "a" });
  });

  it("deslize/scroll actualiza o indicador; clique num indicador e nas setas navega", async () => {
    render(<Carousel slides={slides(4)} label="Teste" />);
    const scroller = screen.getByRole("group", { name: /use as setas do teclado/ });
    mockScroll(scroller);
    scroller.scrollLeft = 632; // 2 slides + 2 gaps
    fireEvent.scroll(scroller);
    await waitFor(() => expect(screen.getByRole("button", { name: "Ir para a imagem 3" })).toHaveAttribute("aria-current", "true"));
    await userEvent.click(screen.getByRole("button", { name: "Ir para a imagem 1" }));
    expect(scroller.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 0 }));
    await userEvent.click(screen.getAllByRole("button", { name: "Imagem seguinte" })[0]);
    expect(screen.getByRole("button", { name: "Ir para a imagem 2" })).toHaveAttribute("aria-current", "true");
  });

  it("durante o scroll animado, eventos de scroll não repõem o índice antigo (sem 'piscar'); depois sincroniza", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"] });
    render(<Carousel slides={slides(5)} label="Teste" />);
    const scroller = screen.getByRole("group", { name: /use as setas do teclado/ });
    mockScroll(scroller);
    fireEvent.keyDown(scroller, { key: "ArrowRight" });
    scroller.scrollLeft = 10; // meio da animação: ainda perto do slide 1
    fireEvent.scroll(scroller);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(screen.getByRole("button", { name: "Ir para a imagem 2" })).toHaveAttribute("aria-current", "true");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800); // fim do bloqueio
    });
    scroller.scrollLeft = 632;
    fireEvent.scroll(scroller);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(screen.getByRole("button", { name: "Ir para a imagem 3" })).toHaveAttribute("aria-current", "true");
  });

  it("muitas imagens → contador e barra de progresso em vez de pontos; uma só imagem → sem controlos", () => {
    const { unmount } = render(<Carousel slides={slides(12)} label="Teste" />);
    expect(screen.getByText("1 / 12")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ir para a imagem/ })).toBeNull();
    unmount();
    render(<Carousel slides={slides(1)} label="Teste" />);
    expect(screen.queryByRole("button", { name: "Imagem seguinte" })).toBeNull();
  });

  it("imagens por vista configuráveis e ecrãs maiores mostram mais", () => {
    const mm = (w: number) => (q: string) =>
      ({
        matches: q.includes("1024") ? w >= 1024 : q.includes("640") ? w >= 640 : false,
        media: q,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList;
    vi.stubGlobal("matchMedia", mm(1280));
    render(<Carousel slides={slides(6)} label="Teste" perView={{ mobile: 1, tablet: 2, desktop: 4 }} />);
    expect(screen.getByRole("group", { name: "1 de 6" })).toHaveStyle({ flexBasis: "calc((100% - 48px) / 4)" });
    vi.unstubAllGlobals();
  });
});

describe("LazyImage / Lightbox", () => {
  it("imagem indisponível → alternativa visível (sem imagem partida)", () => {
    render(<LazyImage src="/x.jpg" alt="Foto" fallbackLabel="Imagem indisponível" />);
    fireEvent.error(screen.getByAltText("Foto"));
    expect(screen.getByRole("img", { name: "Imagem indisponível" })).toBeInTheDocument();
    expect(screen.queryByAltText("Foto")).toBeNull();
  });
  it("skeleton até a imagem carregar; depois visível", () => {
    render(<LazyImage src="/x.jpg" alt="Foto" />);
    expect(document.querySelector(".skeleton")).not.toBeNull();
    expect(screen.getByAltText("Foto").className).toContain("opacity-0");
    fireEvent.load(screen.getByAltText("Foto"));
    expect(document.querySelector(".skeleton")).toBeNull();
    expect(screen.getByAltText("Foto").className).toContain("opacity-100");
  });
  it("Lightbox fecha ao clicar fora (no fundo) e com uma só imagem não mostra setas", () => {
    const onClose = vi.fn();
    render(<Lightbox items={[{ id: "a", alt: "A", src: "/a", full: "/a" }]} index={0} onIndex={() => {}} onClose={onClose} />);
    expect(screen.queryByRole("button", { name: "Imagem seguinte", hidden: true })).toBeNull();
    fireEvent.click(screen.getByRole("dialog", { hidden: true }));
    expect(onClose).toHaveBeenCalled();
  });
});
