import lisbon from "../assets/lisbon-destaque.jpg";
import { waLink } from "../lib/whatsapp";
import { LazyImage } from "./media";
import { Button, Container, Reveal } from "./ui";

export default function Cta() {
  return (
    <section className="pb-14 md:pb-20">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[2rem] px-6 py-14 text-center text-white md:py-20">
          <LazyImage src={lisbon} alt="" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand/90 via-brand/80 to-brand-royal/70" />
          <div className="relative">
            <h2 className="text-balance text-3xl md:text-4xl">Está pronto para dar o próximo passo?</h2>
            <p className="mx-auto mb-7 mt-3 max-w-xl opacity-95">
              Fale com a Central de Agendamento e receba orientação sobre o seu processo.
            </p>
            <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
              <Button variant="light" href={waLink()} target="_blank" rel="noopener">
                Falar connosco no WhatsApp
              </Button>
              <Button variant="ghostLight" href="#servicos">
                Ver os nossos serviços
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
