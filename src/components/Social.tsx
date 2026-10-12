import { Facebook, Instagram, Music2 } from "lucide-react";
import { SITE } from "../config/site";
import { Reveal, Section } from "./ui";

const items = [
  { key: "instagram", name: "Instagram", icon: Instagram, text: "Novidades, dicas e conteúdos sobre o processo." },
  { key: "facebook", name: "Facebook", icon: Facebook, text: "Informações e comunicados da nossa página." },
  { key: "tiktok", name: "TikTok", icon: Music2, text: "Vídeos curtos para esclarecer as suas dúvidas." },
] as const;

export default function Social() {
  return (
    <Section eyebrow="Redes sociais" title="Acompanhe-nos nas redes sociais" className="bg-brand-soft">
      <div className="mt-8 grid gap-3 md:mt-10 md:grid-cols-3 md:gap-5">
        {items.map(({ key, name, icon: Icon, text }, i) => (
          <Reveal key={key} delay={i * 0.06} className="flex">
            <article className="flex flex-1 flex-col items-center rounded-2xl text-center border border-brand-line bg-white p-6 shadow-card transition hover:-translate-y-1">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon />
              </div>
              <h3 className="text-lg text-brand">{name}</h3>
              <b className="text-sm text-brand-royal">{SITE.social[key].handle}</b>
              <p className="mt-2 text-sm text-brand-muted">{text}</p>
              <a
                href={SITE.social[key].url}
                target="_blank"
                rel="noopener"
                className="mt-auto pt-4 inline-block text-sm font-semibold text-brand-royal hover:underline"
              >
                Visitar perfil
              </a>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
