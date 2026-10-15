import { LEGAL_LINKS, SITE, X_LABEL } from "../config/site";
import { waLink } from "../lib/whatsapp";
import { Logo } from "./Logo";
import { Container } from "./ui";

const a = "block py-1 hover:text-white";
export default function Footer({ basePath = "" }: { basePath?: string }) {
  return (
    <footer className="bg-brand-dark pb-8 pt-14 text-sm text-[#C5CEF0]">
      <Container>
        <div className="grid gap-9 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light href={basePath || "#inicio"} />
            <p className="mt-4">Apoio e orientação para processos de agendamento relacionados com pedidos de visto.</p>
          </div>
          <nav aria-label="Rodapé">
            <h3 className="mb-2 font-sans text-base text-white">Links</h3>
            {[
              ["Início", "#inicio"],
              ["Sobre nós", "#sobre"],
              ["Serviços", "#servicos"],
              ["Pacotes", "#pacotes"],
              ["FAQ", "#faq"],
              ["Contactos", "#contactos"],
            ].map(([l, h]) => (
              <a key={h} href={`${basePath}${h}`} className={a}>
                {l}
              </a>
            ))}
          </nav>
          <div>
            <h3 className="mb-2 font-sans text-base text-white">Redes sociais</h3>
            <a href={SITE.social.instagram.url} target="_blank" rel="noopener" className={a}>
              Instagram
            </a>
            <a href={SITE.social.facebook.url} target="_blank" rel="noopener" className={a}>
              Facebook
            </a>
            <a href={SITE.social.tiktok.url} target="_blank" rel="noopener" className={a}>
              TikTok
            </a>
            <a href={SITE.social.x.url} target="_blank" rel="noopener noreferrer" aria-label={X_LABEL} className={a}>
              X
            </a>
            <a href={waLink()} target="_blank" rel="noopener" className={a}>
              WhatsApp
            </a>
          </div>
        </div>
        <div className="mt-9 border-t border-white/15 pt-5 text-xs text-[#9EA9DD]">
          <nav aria-label="Legal" className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {LEGAL_LINKS.map(([label, href]) => (
              <a key={href} href={href} className="py-1 text-[#C5CEF0] underline-offset-4 hover:text-white hover:underline">
                {label}
              </a>
            ))}
          </nav>
          <p>© 2026 Central de Agendamento. Todos os direitos reservados.</p>
          <p className="mt-2">
            A Central de Agendamento é uma empresa privada de prestação de serviços. Não é uma entidade governamental, não representa o
            Consulado de Portugal e não garante a aprovação de pedidos de visto.
          </p>
        </div>
      </Container>
    </footer>
  );
}
