import { motion } from "framer-motion";
import { ArrowLeft, Facebook, Instagram, Mail, MessageCircle, Music2 } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Button, Container, Reveal } from "../components/ui";
import WhatsAppFab from "../components/WhatsAppFab";
import XIcon from "../components/XIcon";
import { type Block, LEGAL_REVIEW_NOTICE, LEGAL_REVIEW_TEXT, type LegalDoc } from "../config/legal";
import { SITE, X_LABEL } from "../config/site";
import { hidden, SPRING, shown } from "../lib/motion";
import { waLink } from "../lib/whatsapp";

const P = "text-[0.98rem] leading-relaxed text-brand-ink/90 sm:text-base";

function Contact({ cta }: { cta: string }) {
  const rows = [
    { icon: MessageCircle, label: "WhatsApp", value: SITE.phoneLabel, href: waLink() },
    { icon: Instagram, label: "Instagram", value: SITE.social.instagram.handle, href: SITE.social.instagram.url },
    { icon: Facebook, label: "Facebook", value: SITE.social.facebook.handle, href: SITE.social.facebook.url },
    { icon: Music2, label: "TikTok", value: SITE.social.tiktok.handle, href: SITE.social.tiktok.url },
    { icon: XIcon, label: "X", value: SITE.social.x.handle, href: SITE.social.x.url, x: true },
    { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  ];
  return (
    <div className="rounded-2xl border border-brand-line bg-surface p-5 shadow-card sm:p-6">
      <p className="font-serif text-lg font-bold text-fg-brand">{SITE.name}</p>
      <ul className="mt-3 divide-y divide-brand-line">
        {rows.map((r) => {
          const { icon: Icon, label, value, href } = r;
          return (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={"x" in r ? "noopener noreferrer" : "noopener"}
                aria-label={"x" in r ? X_LABEL : undefined}
                className="flex items-center gap-3 py-3 transition-colors duration-150 hover:text-fg-royal"
              >
                <Icon className="shrink-0 text-fg-royal" size={20} />
                <span className="min-w-0">
                  <b className="block text-sm">{label}</b>
                  <span className="break-all text-[0.8rem] text-brand-muted sm:text-sm">{value}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      <Button href={waLink()} target="_blank" rel="noopener" className="mt-5 uppercase tracking-wide">
        {cta}
      </Button>
    </div>
  );
}

function BlockView({ b, doc }: { b: Block; doc: LegalDoc }) {
  switch (b.t) {
    case "p":
      return <p className={P}>{b.text}</p>;
    case "ul":
      return (
        <ul className={`list-disc space-y-1.5 pl-5 marker:text-fg-royal ${P}`}>
          {b.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div className="rounded-2xl border border-brand-line bg-brand-soft p-4 sm:p-5">
          {b.title && <p className="mb-1 font-semibold text-fg-brand">{b.title}</p>}
          <p className={`${P} text-brand-ink`}>{b.text}</p>
        </div>
      );
    case "placeholder":
      return (
        <p
          data-placeholder
          className="rounded-xl border border-dashed border-brand-royal/40 bg-brand-soft px-4 py-3 text-sm font-medium text-fg-brand"
        >
          {b.text}
        </p>
      );
    case "updated":
      return (
        <p className="text-sm font-medium text-fg-brand">
          Última actualização: <span data-updated>{doc.updated}</span>
        </p>
      );
    case "contact":
      return <Contact cta={doc.contactCta} />;
  }
}

/** Layout partilhado das páginas jurídicas: mesma navbar, footer e botão de WhatsApp da landing. */
export default function LegalLayout({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <Navbar basePath="/" />
      <main id="conteudo">
        <header className="bg-gradient-to-br from-brand-dark to-brand text-white">
          <Container className="max-w-[60rem] py-10 sm:py-14">
            <motion.div initial={hidden} animate={shown} transition={SPRING}>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-white/85 transition-colors duration-150 hover:text-white"
              >
                <ArrowLeft size={16} aria-hidden /> Voltar ao início
              </a>
              <h1 className="mt-5 text-balance text-3xl leading-tight sm:text-5xl">{doc.title}</h1>
              <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">{doc.subtitle}</p>
              <p className="mt-4 text-sm text-white/70">
                Última actualização: <span>{doc.updated}</span>
              </p>
            </motion.div>
          </Container>
        </header>

        <Container className="max-w-[60rem] py-10 sm:py-14">
          {LEGAL_REVIEW_NOTICE && (
            <div role="note" className="mb-8 rounded-2xl border border-brand-line bg-brand-soft p-4 text-sm text-fg-brand sm:p-5">
              {LEGAL_REVIEW_TEXT}
            </div>
          )}

          <Reveal>
            <nav aria-label="Índice" className="rounded-2xl border border-brand-line bg-surface p-5 shadow-card sm:p-6">
              <p className="mb-3 font-serif text-lg font-bold text-fg-brand">Nesta página</p>
              <ol className="grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
                {doc.sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex gap-2 py-1 text-fg-royal underline-offset-4 hover:underline">
                      <span className="w-6 shrink-0 text-brand-muted">{i + 1}.</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>

          <div className="mt-10 space-y-10">
            {doc.sections.map((s, i) => (
              <Reveal key={s.id}>
                <section id={s.id} aria-labelledby={`${s.id}-t`} className="border-t border-brand-line pt-8">
                  <h2 id={`${s.id}-t`} className="mb-4 text-2xl text-fg-brand sm:text-[1.7rem]">
                    {i + 1}. {s.title}
                  </h2>
                  <div className="space-y-4">
                    {s.blocks.map((b, k) => (
                      <BlockView key={`${s.id}-${b.t}-${k}`} b={b} doc={doc} />
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>
        </Container>
      </main>
      <Footer basePath="/" />
      <WhatsAppFab />
    </>
  );
}
