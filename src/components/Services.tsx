import { PROCESS_TYPES, SERVICES, SITE } from "../config/site";
import { waLink } from "../lib/whatsapp";
import { Reveal, Section } from "./ui";

export default function Services() {
  return (
    <Section
      id="servicos"
      eyebrow="Serviços"
      title="Os nossos serviços"
      lead="Apoio profissional para tornar o seu processo mais simples e organizado."
      className="bg-brand-soft"
    >
      <div className="mt-9 flex flex-wrap justify-center gap-3 text-left sm:mt-11 sm:gap-5">
        {SERVICES.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={(i % 3) * 0.06} className="flex w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
            <article className="flex flex-1 gap-4 rounded-2xl p-5 sm:flex-col sm:gap-0 sm:p-6 rounded-2xl border border-brand-line bg-surface shadow-card transition hover:-translate-y-1 hover:border-brand-royal">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-fg-brand sm:mb-4 sm:h-12 sm:w-12">
                <Icon />
              </div>
              <div className="flex flex-1 flex-col">
                <h3 className="mb-1 text-base text-fg-brand sm:mb-2 sm:text-lg">{title}</h3>
                <p className="text-sm text-brand-muted">{text}</p>
                <a
                  href={waLink(`Olá, Central de Agendamento. Gostaria de saber mais sobre: ${title}.`)}
                  target="_blank"
                  rel="noopener"
                  className="mt-auto pt-4 inline-block text-sm font-semibold text-fg-royal hover:underline"
                >
                  Saber mais
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      {SITE.showProcessTypes && (
        <Reveal className="mt-16 text-center">
          <h3 className="text-2xl text-fg-brand">Tipos de processo</h3>
          <p className="mt-2 text-brand-muted">Apoio disponível de acordo com o tipo de processo.</p>
          <ul className="mt-7 flex flex-wrap justify-center gap-3">
            {PROCESS_TYPES.map((t) => (
              <li key={t} className="rounded-full border border-brand-line bg-surface px-5 py-3 font-medium text-fg-brand">
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </Section>
  );
}
