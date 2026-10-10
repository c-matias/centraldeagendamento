import { motion, useScroll } from "framer-motion";
import { useRef } from "react";
import flight from "../assets/cta-flight.jpg";
import { STEPS, TRUST } from "../config/site";
import { revealProps } from "../lib/motion";
import { waLink } from "../lib/whatsapp";
import { LazyImage } from "./media";
import { Button, Container, Section } from "./ui";

export function Steps() {
  const ref = useRef<HTMLOListElement>(null);
  // progresso: a linha preenche à medida que o utilizador avança pelas etapas
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 65%"] });
  return (
    <Section id="como" eyebrow="Processo" title="Como funciona?" className="bg-brand-soft">
      <ol ref={ref} className="relative my-12 grid gap-8 text-left lg:grid-cols-5 lg:gap-5">
        <span
          aria-hidden
          className="absolute bottom-0 left-[22px] top-0 w-0.5 bg-brand-line lg:bottom-auto lg:left-[8%] lg:right-[8%] lg:top-[22px] lg:h-0.5 lg:w-auto"
        />
        <motion.span
          aria-hidden
          style={{ scaleY: scrollYProgress }}
          className="absolute bottom-0 left-[22px] top-0 w-0.5 origin-top bg-brand-royal lg:hidden"
        />
        <motion.span
          aria-hidden
          style={{ scaleX: scrollYProgress }}
          className="absolute left-[8%] right-[8%] top-[22px] hidden h-0.5 origin-left bg-brand-royal lg:block"
        />
        {STEPS.map(([title, text], i) => (
          <motion.li key={title} {...revealProps(i * 0.08)} className="relative pl-16 lg:pl-0 lg:text-center">
            <span className="absolute left-0 top-0 z-10 grid h-11 w-11 place-items-center rounded-full bg-brand font-bold text-white ring-[6px] ring-brand-soft lg:relative lg:mx-auto lg:mb-4">
              0{i + 1}
            </span>
            <h3 className="mb-1 text-base text-brand">{title}</h3>
            <p className="text-sm text-brand-muted">{text}</p>
          </motion.li>
        ))}
      </ol>
      <div className="text-center">
        <Button href={waLink()} target="_blank" rel="noopener">
          Quero iniciar o meu processo
        </Button>
      </div>
    </Section>
  );
}

export function TrustBar() {
  return (
    <div className="relative overflow-hidden bg-brand py-12 text-white">
      <LazyImage src={flight} alt="" className="absolute inset-0 opacity-30" />
      <div className="absolute inset-0 bg-brand/80" />
      <Container className="relative grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
        {TRUST.map(({ icon: Icon, label }, i) => (
          <motion.div key={label} {...revealProps(i * 0.06)} className="flex items-center gap-3 text-sm font-semibold sm:text-base">
            <Icon className="shrink-0 text-brand-sky" />
            {label}
          </motion.div>
        ))}
      </Container>
    </div>
  );
}
