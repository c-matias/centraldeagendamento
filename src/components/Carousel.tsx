import { ChevronLeft, ChevronRight } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { GALLERY } from "../config/gallery";

type PerView = typeof GALLERY.slidesPerView;
const GAP = 16;
// Nota: role="group" + aria-roledescription segue o padrão APG de carrossel; por isso a regra useSemanticElements está desligada neste ficheiro (biome.json).

function usePerView(perView: PerView): number {
  const get = () =>
    typeof window === "undefined"
      ? perView.mobile
      : window.matchMedia("(min-width:1024px)").matches
        ? perView.desktop
        : window.matchMedia("(min-width:640px)").matches
          ? perView.tablet
          : perView.mobile;
  const [n, setN] = useState(get);
  useEffect(() => {
    const qs = [window.matchMedia("(min-width:1024px)"), window.matchMedia("(min-width:640px)")];
    const on = () => setN(get());
    on();
    for (const q of qs) q.addEventListener?.("change", on);
    return () => {
      for (const q of qs) q.removeEventListener?.("change", on);
    };
  }, [perView]);
  return Math.max(1, n);
}

type Props = { slides: ReactNode[]; label: string; perView?: PerView; onSlideChange?: (index: number) => void };

/** Carrossel com scroll-snap nativo: deslize em telemóvel, setas, indicadores e teclado (←/→/Home/End). Sem dependências. */
export default function Carousel({ slides, label, perView = GALLERY.slidesPerView, onSlideChange }: Props) {
  const per = usePerView(perView);
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  /** Enquanto o scroll animado por setas/teclado decorre, os eventos de scroll não podem repor o índice antigo (evita "piscar" no indicador). */
  const lock = useRef<number | undefined>(undefined);
  const positions = Math.max(1, slides.length - per + 1);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const step = useCallback(() => {
    const el = scroller.current;
    const first = el?.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + GAP : 0;
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const el = scroller.current;
      if (!el) return;
      const target = Math.min(Math.max(i, 0), positions - 1);
      window.clearTimeout(lock.current);
      lock.current = window.setTimeout(() => {
        lock.current = undefined;
      }, 700);
      el.scrollTo({ left: target * step(), behavior: reduce ? "auto" : "smooth" });
      setIndex(target);
    },
    [positions, step, reduce],
  );

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (lock.current !== undefined) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const s = step();
        if (s) setIndex(Math.min(Math.round(el.scrollLeft / s), positions - 1));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [positions, step]);

  useEffect(() => {
    onSlideChange?.(index);
  }, [index, onSlideChange]);

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: positions - 1 };
    if (e.key in map) {
      e.preventDefault();
      goTo(map[e.key]);
    }
  };

  const slideBasis = `calc((100% - ${GAP * (per - 1)}px) / ${per})`;
  const dots = positions <= 8;
  const arrow =
    "grid h-11 w-11 place-items-center rounded-full border border-brand-line bg-surface text-fg-brand shadow-card transition duration-150 hover:bg-brand-soft active:scale-95 disabled:pointer-events-none disabled:opacity-40";

  return (
    <section aria-roledescription="carrossel" aria-label={label} className="relative">
      <div
        ref={scroller}
        role="group"
        aria-label={`${label}: use as setas do teclado para navegar`}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: região de scroll horizontal tem de ser focável para navegar por teclado (WCAG 2.1.1)
        tabIndex={0}
        onKeyDown={onKey}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth rounded-2xl pb-1 outline-offset-4 [-ms-overflow-style:none] [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${slides.length}`}
            className="min-w-0 shrink-0 snap-start"
            style={{ flexBasis: slideBasis }}
          >
            {s}
          </div>
        ))}
      </div>

      {positions > 1 && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-2 sm:flex">
            <button
              type="button"
              aria-label="Imagem anterior"
              disabled={index <= 0}
              onClick={() => goTo(index - 1)}
              className={`pointer-events-auto -translate-x-1/2 ${arrow}`}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Imagem seguinte"
              disabled={index >= positions - 1}
              onClick={() => goTo(index + 1)}
              className={`pointer-events-auto translate-x-1/2 ${arrow}`}
            >
              <ChevronRight size={22} />
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Imagem anterior"
              disabled={index <= 0}
              onClick={() => goTo(index - 1)}
              className={`sm:hidden ${arrow}`}
            >
              <ChevronLeft size={20} />
            </button>
            {dots ? (
              <ol className="flex items-center gap-2" aria-label="Indicadores de posição">
                {Array.from({ length: positions }, (_, i) => `d${i}`).map((k, i) => (
                  <li key={k}>
                    <button
                      type="button"
                      aria-label={`Ir para a imagem ${i + 1}`}
                      aria-current={i === index ? "true" : undefined}
                      onClick={() => goTo(i)}
                      className={`block h-2.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-brand" : "w-2.5 bg-brand-line hover:bg-brand-sky"}`}
                    />
                  </li>
                ))}
              </ol>
            ) : (
              <div className="flex w-40 flex-col items-center gap-2">
                <span className="text-sm text-brand-muted" aria-live="polite">
                  {index + 1} / {positions}
                </span>
                <div className="h-1 w-full overflow-hidden rounded-full bg-brand-line" aria-hidden>
                  <div
                    className="h-full origin-left rounded-full bg-brand-royal transition-transform duration-300"
                    style={{ transform: `scaleX(${(index + 1) / positions})` }}
                  />
                </div>
              </div>
            )}
            <button
              type="button"
              aria-label="Imagem seguinte"
              disabled={index >= positions - 1}
              onClick={() => goTo(index + 1)}
              className={`sm:hidden ${arrow}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
