import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { FAQ } from "../config/site";
import { hidden, leave, SPRING, shown } from "../lib/motion";
import { Section } from "./ui";

const INITIAL = 6;

function Item({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={hidden}
      animate={shown}
      exit={leave}
      transition={{ ...SPRING, delay }}
      className={`mb-3 rounded-2xl border bg-white px-5 transition-colors duration-200 ${open ? "border-brand-royal" : "border-brand-line"}`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left font-semibold"
      >
        {q}
        <Plus
          aria-hidden
          size={22}
          className={`shrink-0 text-brand-royal transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "rotate-45" : ""}`}
        />
      </button>
      {/* abre/fecha sem animar height: grid-template-rows 0fr→1fr */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className={`overflow-hidden transition-[visibility] ${open ? "visible" : "invisible delay-300"}`}>
          <p className={`pb-4 text-brand-muted transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}>{a}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Faq() {
  const [all, setAll] = useState(false);
  const list = all ? FAQ : FAQ.slice(0, INITIAL);
  return (
    <Section id="faq" eyebrow="FAQ" title="Perguntas frequentes">
      <div className="mx-auto mt-8 max-w-3xl text-left md:mt-10">
        <AnimatePresence initial>
          {list.map(([q, a], idx) => (
            <Item key={q} q={q} a={a} delay={(idx % INITIAL) * 0.05} />
          ))}
        </AnimatePresence>
        {FAQ.length > INITIAL && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setAll(!all)}
              aria-expanded={all}
              className="rounded-full border-2 border-brand px-6 py-3 font-semibold text-brand transition duration-150 hover:bg-brand-soft active:scale-[0.98]"
            >
              {all ? "Ver menos perguntas" : `Ver todas as perguntas (${FAQ.length})`}
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}
