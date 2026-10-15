import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import { SITE, TESTIMONIALS } from "../config/site";
import { hidden, leave, SPRING, shown } from "../lib/motion";
import { Button, Section } from "./ui";

const STAR_KEYS = ["s1", "s2", "s3", "s4", "s5"];
const DURATION = 6; // segundos por testemunho

export default function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = TESTIMONIALS.length;
  const go = (k: number) => setI((k + n) % n);
  const t = TESTIMONIALS[i];
  return (
    <Section id="feedbacks" eyebrow="Feedbacks" title="O que dizem os nossos clientes">
      <section
        className="mx-auto mt-10 max-w-2xl"
        aria-roledescription="carrossel"
        aria-label="Testemunhos"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="overflow-hidden rounded-3xl border border-brand-line bg-surface shadow-card">
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={i}
              initial={hidden}
              animate={shown}
              exit={leave}
              transition={SPRING}
              aria-live="polite"
              className="p-6 text-left sm:p-8"
            >
              <div className="flex gap-1 text-fg-royal" role="img" aria-label={`${t.stars} estrelas`}>
                {STAR_KEYS.slice(0, t.stars).map((k) => (
                  <Star key={k} size={18} fill="currentColor" />
                ))}
              </div>
              <blockquote className="mt-3 text-base sm:text-lg">“{t.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft font-bold text-fg-brand">
                  {t.name.replace(/[[\]]/g, "")[0]}
                </span>
                <span>
                  <b className="block">{t.name}</b>
                  {t.name.startsWith("[") && (
                    <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs text-brand-muted">Exemplo / placeholder</span>
                  )}
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          {/* barra de progresso do avanço automático; pausa com rato/foco; desligada com "reduzir movimento" */}
          {!reduce && (
            <div className="h-1 bg-brand-soft" aria-hidden>
              <div
                key={i}
                onAnimationEnd={() => go(i + 1)}
                className="h-full origin-left bg-brand-royal"
                style={{ animation: `progress ${DURATION}s linear forwards`, animationPlayState: paused ? "paused" : "running" }}
              />
            </div>
          )}
        </div>
        <div className="my-5 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Testemunho anterior"
            onClick={() => go(i - 1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-brand-line bg-surface text-fg-brand transition duration-150 hover:bg-brand-soft active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="min-w-14 text-center text-sm text-brand-muted">
            {i + 1} / {n}
          </span>
          <button
            type="button"
            aria-label="Próximo testemunho"
            onClick={() => go(i + 1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-brand-line bg-surface text-fg-brand transition duration-150 hover:bg-brand-soft active:scale-95"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>
      <div className="text-center">
        <Button variant="outline" href={SITE.social.instagram.url} target="_blank" rel="noopener">
          Ver mais feedbacks
        </Button>
      </div>
    </Section>
  );
}
