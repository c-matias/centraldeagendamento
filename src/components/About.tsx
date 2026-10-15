import documentacaoViagem from "../assets/appointment.jpeg";
import { ABOUT_POINTS } from "../config/site";
import { waLink } from "../lib/whatsapp";
import { LazyImage } from "./media";
import { Button, Container, Reveal } from "./ui";

export default function About() {
  return (
    <section id="sobre" className="py-14 md:py-20">
      <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card lg:aspect-auto lg:min-h-[30rem]">
          <LazyImage
            src={documentacaoViagem}
            alt="Documentos de agendamento sobre uma secretária de trabalho"
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
        <Reveal>
          <h2 className="text-3xl text-fg-brand md:text-4xl">Simplificamos o caminho para o seu processo.</h2>
          <p className="mt-4 text-lg text-brand-muted">
            A Central de Agendamento presta serviços de apoio a pessoas que necessitam de orientação e assistência durante o processo de
            agendamento relacionado com pedidos de visto.
          </p>
          <p className="mt-3 text-brand-muted">
            O nosso propósito é tornar o processo mais organizado, claro e simples, ajudando cada cliente a compreender as etapas
            necessárias e a preparar-se adequadamente para o seu atendimento.
          </p>
          <ul className="my-6 grid gap-4">
            {ABOUT_POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3.5">
                <Icon className="mt-1 shrink-0 text-fg-royal" />
                <div>
                  <b>{title}</b>
                  <p className="text-sm text-brand-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <Button href={waLink()} target="_blank" rel="noopener">
            Falar com a nossa equipa
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
