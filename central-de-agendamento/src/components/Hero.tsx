import { motion } from "framer-motion";
import { Check } from "lucide-react";
import portugal from "../assets/hero-passport.jpg";
import { hidden, SPRING, shown } from "../lib/motion";
import { waLink } from "../lib/whatsapp";
import { LazyImage } from "./media";
import { Button, Container, Reveal } from "./ui";

export default function Hero() {
  return (
    <section id="inicio" className="bg-gradient-to-b from-brand-soft to-white pb-14 pt-8 md:pb-20 md:pt-14">
      <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
        <Reveal>
          <p className="mb-3 text-sm font-semibold text-brand-royal">Apoio a processos de visto em Angola</p>
          <h1 className="text-balance text-[2.1rem] leading-[1.12] tracking-tight text-brand sm:text-5xl md:text-6xl">
            O seu processo de agendamento começa aqui.
          </h1>
          <p className="mt-5 max-w-xl text-base text-brand-muted sm:text-lg">
            Apoiamos e orientamos o seu processo de agendamento para pedidos de visto, com atendimento personalizado e acompanhamento em
            cada etapa.
          </p>
          <div className="my-7 flex flex-col gap-3 sm:flex-row">
            <Button href={waLink()} target="_blank" rel="noopener">
              Agendar atendimento
            </Button>
            <Button variant="outline" href={waLink()} target="_blank" rel="noopener">
              Falar connosco no WhatsApp
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-brand-muted">
            {["Atendimento personalizado", "Orientação", "Acompanhamento"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check size={16} className="text-brand-royal" />
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <motion.div initial={hidden} animate={shown} transition={{ ...SPRING, delay: 0.1 }}>
            <LazyImage
              src={portugal}
              priority
              width={1100}
              height={1375}
              alt="Mulher a segurar um passaporte angolano e um cartão de embarque num aeroporto"
              className="aspect-[5/6] w-full rounded-3xl shadow-card"
              imgClassName="object-[50%_15%]"
            />
          </motion.div>
          <motion.div
            initial={hidden}
            animate={shown}
            transition={{ ...SPRING, delay: 0.45 }}
            className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 shadow-card backdrop-blur sm:right-auto sm:w-72"
          >
            <b className="block text-brand">Acompanhamento</b>
            <span className="text-sm text-brand-muted">Do agendamento ao dia do atendimento.</span>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
