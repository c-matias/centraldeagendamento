import { Check } from "lucide-react";
import { PACKAGES } from "../config/site";
import { waLink } from "../lib/whatsapp";
import { Button, Reveal, Section } from "./ui";

export default function Packages() {
  return (
    <Section
      id="pacotes"
      eyebrow="Pacotes"
      title="Escolha o pacote ideal para si"
      lead="Combine os serviços de acordo com a fase do seu processo."
    >
      <p className="mt-6 text-xs text-brand-muted sm:hidden">Deslize para ver os pacotes →</p>
      <div className="-mx-5 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 text-left sm:mx-0 sm:mt-11 sm:flex-wrap sm:justify-center sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0">
        {PACKAGES.map((p, i) => (
          <Reveal
            key={p.name}
            delay={(i % 3) * 0.06}
            className="flex w-[82%] shrink-0 snap-center sm:w-[calc(50%-10px)] sm:shrink lg:w-[calc(33.333%-14px)]"
          >
            <article
              className={`flex flex-1 flex-col rounded-2xl bg-surface p-6 shadow-card transition hover:-translate-y-1 ${p.highlight ? "border-2 border-fg-brand" : "border border-brand-line hover:border-brand-royal"}`}
            >
              {p.highlight && (
                <span className="mb-3 self-start rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Todos os serviços</span>
              )}
              <h3 className="text-xl text-fg-brand">{p.name}</h3>
              <p className="mt-1 font-serif text-2xl font-bold text-fg-royal">
                <span className="sr-only">Preço: </span>
                {p.price}
              </p>
              <ul className="my-4 grid gap-2.5 text-sm">
                {p.items.map((i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check size={18} className="mt-0.5 shrink-0 text-fg-royal" />
                    {i}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-auto"
                href={waLink(`Olá, Central de Agendamento. Tenho interesse no ${p.name}.`)}
                target="_blank"
                rel="noopener"
              >
                Pedir este pacote
              </Button>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
