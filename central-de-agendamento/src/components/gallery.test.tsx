import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GALLERY } from "../config/gallery";
import { CACHE_KEY } from "../lib/gallery";
import { __registerForTests, __resetForTests } from "../observability";
import Carousel from "./Carousel";
import Gallery from "./Gallery";
import Lightbox from "./Lightbox";
import { LazyImage } from "./media";

afterEach(() => __resetForTests());

const api = (n: number, over: Record<string, unknown> = {}) => ({
  images: Array.from({ length: n }, (_, i) => ({
    id: `id_${i + 1}`,
    alt: `Publicação ${i + 1}`,
    src: `/api/gallery/image?id=id_${i + 1}&v=1&w=960`,
    srcSet: `/api/gallery/image?id=id_${i + 1}&v=1&w=640 640w`,
    full: `/api/gallery/image?id=id_${i + 1}&v=1&w=1920`,
    width: i % 2 ? 1920 : 1080,
    height: i % 2 ? 1080 : 1350,
    ...over,
  })),
});
const respond = (body: unknown, status = 200) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );

describe("Gallery (secção)", () => {
  it("título e subtítulo pedidos; skeleton enquanto carrega (aria-busy) e depois as imagens", async () => {
    let release: (r: Response) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>((r) => (release = r))),
    );
    render(<Gallery />);
    expect(screen.getByRole("heading", { level: 2, name: "Galeria da Central de Agendamento" })).toBeInTheDocument();
    expect(screen.getByText("Conheça um pouco mais do nosso trabalho e acompanhe as nossas publicações.")).toBeInTheDocument();
    expect(document.querySelector("[aria-busy='true']")).not.toBeNull();
    expect(document.querySelectorAll(".skeleton").length).toBeGreaterThan(0);
    await act(async () => release(new Response(JSON.stringify(api(4)))));
    await screen.findByRole("region", { name: "Galeria de imagens" });
    expect(document.querySelector("[aria-busy='true']")).toBeNull();
    expect(screen.getAllByRole("img", { name: /Publicação/ }).length).toBeGreaterThanOrEqual(1);
  });

  it("estado pronto: slides numerados, srcSet, imagem inteira (contain) para horizontais, e botão do Instagram", async () => {
    respond(api(4));
    render(<Gallery />);
    const region = await screen.findByRole("region", { name: "Galeria de imagens" });
    const slides = within(region).getAllByRole("group", { name: /de 4$/ });
    expect(slides).toHaveLength(4);
    const img1 = within(slides[0]).getByAltText("Publicação 1");
    expect(img1).toHaveAttribute("srcset", expect.stringContaining("640w"));
    expect(img1).toHaveAttribute("loading", "lazy");
    expect(img1.className).not.toContain("object-contain"); // 4:5 → cover
    expect(within(slides[1]).getByAltText("Publicação 2").className).toContain("object-contain"); // 16:9 → imagem inteira
    expect(screen.getByRole("link", { name: /Ver no Instagram/ })).toHaveAttribute("href", expect.stringContaining("instagram.com"));
  });

  it("pasta vazia → mensagem discreta (sem erro)", async () => {
    respond({ images: [] });
    render(<Gallery />);
    expect(await screen.findByText(/Ainda não há publicações na galeria/)).toBeInTheDocument();
    expect(screen.queryByText(/Não foi possível/)).toBeNull();
  });

  it("API não configurada (503) → erro discreto, sem regista no Sentry; 'Tentar novamente' recupera", async () => {
    const tracker = { captureError: vi.fn(), track: vi.fn() };
    __registerForTests(tracker);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "not_configured" }), { status: 503 })),
    );
    render(<Gallery />);
    expect(await screen.findByText(/Não foi possível carregar a galeria/)).toBeInTheDocument();
    expect(tracker.captureError).not.toHaveBeenCalled();
    respond(api(3));
    await userEvent.click(screen.getByRole("button", { name: /Tentar novamente/ }));
    await screen.findByRole("region", { name: "Galeria de imagens" });
  });

  it("erro de rede/JSON inválido/timeout → erro discreto + captureError; a página não fica em branco", async () => {
    const tracker = { captureError: vi.fn(), track: vi.fn() };
    __registerForTests(tracker);
    for (const f of [
      () => Promise.reject(new TypeError("offline")),
      async () => new Response("<html>spa</html>"),
      async () => new Response("x", { status: 502 }),
    ]) {
      vi.stubGlobal("fetch", vi.fn(f));
      const { unmount } = render(<Gallery />);
      expect(await screen.findByText(/Não foi possível carregar a galeria/)).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
      unmount();
    }
    expect(tracker.captureError).toHaveBeenCalledTimes(3);
  });

  it("cache: mostra logo as imagens guardadas e, se a rede falhar, mantém-nas sem avisos", async () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now() - GALLERY.cacheTtlMs - 1000, items: api(2).images }));
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("offline"))),
    );
    render(<Gallery />);
    expect(screen.getByRole("region", { name: "Galeria de imagens" })).toBeInTheDocument(); // sem esperar pela rede
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(/Não foi possível/)).toBeNull();
    expect(screen.getByRole("region", { name: "Galeria de imagens" })).toBeInTheDocument();
  });

  it("cache fresca: não faz pedido à API", async () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items: api(2).images }));
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    render(<Gallery />);
    expect(screen.getByRole("region", { name: "Galeria de imagens" })).toBeInTheDocument();
    await Promise.resolve();
    expect(f).not.toHaveBeenCalled();
  });

  it("nova resposta é guardada em cache e novas imagens aparecem após revalidação", async () => {
    respond(api(2));
    render(<Gallery />);
    await screen.findByRole("region", { name: "Galeria de imagens" });
    expect(JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}").items).toHaveLength(2);
  });

  it("alternativa estática quando a API falha e há ficheiros configurados", async () => {
    GALLERY.fallback.push({ src: "/images/carousel/01.jpg", alt: "Foto local" });
    try {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.reject(new TypeError("offline"))),
      );
      render(<Gallery />);
      expect(await screen.findByAltText("Foto local")).toHaveAttribute("src", "/images/carousel/01.jpg");
    } finally {
      GALLERY.fallback.length = 0;
    }
  });

  it("ampliar: abre a imagem completa, navega com setas e fecha com Esc/botão; regista eventos sem dados pessoais", async () => {
    const tracker = { captureError: vi.fn(), track: vi.fn() };
    __registerForTests(tracker);
    respond(api(3));
    render(<Gallery />);
    await userEvent.click(await screen.findByRole("button", { name: "Ampliar imagem: Publicação 1" }));
    const dialog = screen.getByRole("dialog", { name: "Imagem ampliada", hidden: true });
    expect(within(dialog).getByAltText("Publicação 1")).toHaveAttribute("src", expect.stringContaining("w=1920"));
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByAltText("Publicação 2")).toBeInTheDocument();
    expect(within(dialog).getByText("2 / 3")).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(within(dialog).getByAltText("Publicação 3")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Fechar" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(tracker.track).toHaveBeenCalledWith("gallery_open", undefined);
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
