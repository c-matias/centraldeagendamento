import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Facebook, Instagram, Loader2, Mail, MapPin, MessageCircle, Music2, Phone, Send } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { FORM_TYPES, SITE, X_LABEL } from "../config/site";
import { waLink } from "../lib/whatsapp";
import { track } from "../observability";
import { Section } from "./ui";
import XIcon from "./XIcon";

const field =
  "mb-4 w-full rounded-xl border border-brand-line bg-surface px-3.5 py-3 text-brand-ink outline-none transition duration-200 focus:border-brand-royal focus:ring-4 focus:ring-brand-royal/15";
const rows = [
  { icon: MessageCircle, label: "WhatsApp", value: SITE.phoneLabel, href: waLink() },
  { icon: Phone, label: "Telefone", value: SITE.phoneLabel, href: `tel:${SITE.phone}` },
  { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { icon: Instagram, label: "Instagram", value: SITE.social.instagram.handle, href: SITE.social.instagram.url },
  { icon: Facebook, label: "Facebook", value: SITE.social.facebook.handle, href: SITE.social.facebook.url },
  { icon: Music2, label: "TikTok", value: SITE.social.tiktok.handle, href: SITE.social.tiktok.url },
  { icon: XIcon, label: "X", value: SITE.social.x.handle, href: SITE.social.x.url, x: true },
  { icon: Clock, label: "Horário de atendimento", value: SITE.hours, href: undefined },
  { icon: MapPin, label: "Localização", value: SITE.location, href: undefined },
];

export default function Contact() {
  const [f, setF] = useState({ nome: "", tel: "", tipo: FORM_TYPES[0], msg: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  useEffect(() => {
    if (status === "idle") return;
    const t = setTimeout(() => setStatus(status === "sending" ? "done" : "idle"), status === "sending" ? 1000 : 3500);
    return () => clearTimeout(t);
  }, [status]);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    const extra = f.msg.trim() ? ` Mensagem: ${f.msg.trim()}` : "";
    window.open(
      waLink(`Olá, Central de Agendamento. O meu nome é ${f.nome.trim()} (${f.tel.trim()}). Tipo de processo: ${f.tipo}.${extra}`),
      "_blank",
      "noopener",
    );
    track("form_submit", { tipo: f.tipo });
    setStatus("sending");
  };
  return (
    <Section id="contactos" eyebrow="Contactos" title="Entre em contacto connosco" className="pt-0">
      <div className="mt-10 grid gap-11 text-left lg:grid-cols-[1fr_1.1fr]">
        <ul>
          {rows.map((r) => {
            const { icon: Icon, label, value, href } = r;
            const inner = (
              <>
                <Icon className="shrink-0 text-fg-royal" />
                <span>
                  <b className="block">{label}</b>
                  <small className="break-all text-brand-muted sm:break-normal">{value}</small>
                </span>
              </>
            );
            const cls = "flex items-center gap-3 border-b border-brand-line py-3";
            return (
              <li key={label}>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={"x" in r ? "noopener noreferrer" : "noopener"}
                    aria-label={"x" in r ? X_LABEL : undefined}
                    className={cls}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
        <form onSubmit={submit} className="rounded-3xl border border-brand-line bg-surface p-7 shadow-card">
          <label htmlFor="nome" className="mb-1.5 block text-sm font-semibold">
            Nome completo
          </label>
          <input id="nome" required autoComplete="name" value={f.nome} onChange={set("nome")} className={field} />
          <label htmlFor="tel" className="mb-1.5 block text-sm font-semibold">
            Número de telefone
          </label>
          <input id="tel" type="tel" required autoComplete="tel" value={f.tel} onChange={set("tel")} className={field} />
          <label htmlFor="tipo" className="mb-1.5 block text-sm font-semibold">
            Tipo de processo
          </label>
          <select id="tipo" value={f.tipo} onChange={set("tipo")} className={field}>
            {FORM_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <label htmlFor="msg" className="mb-1.5 block text-sm font-semibold">
            Mensagem
          </label>
          <textarea id="msg" rows={4} value={f.msg} onChange={set("msg")} className={field} />
          <button
            type="submit"
            disabled={status !== "idle"}
            aria-live="polite"
            className="relative inline-flex min-h-12 w-full items-center justify-center overflow-hidden rounded-full bg-brand px-6 py-3.5 font-semibold text-white transition duration-150 hover:bg-brand-royal active:scale-[0.98] disabled:cursor-default sm:w-auto"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={status}
                initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                transition={{ duration: 0.18 }}
                className="inline-flex items-center gap-2"
              >
                {status === "idle" && (
                  <>
                    <Send size={18} />
                    Solicitar atendimento
                  </>
                )}
                {status === "sending" && (
                  <>
                    <Loader2 size={18} className="animate-spin" />A abrir o WhatsApp…
                  </>
                )}
                {status === "done" && (
                  <>
                    <Check size={18} />
                    Pronto! Continue no WhatsApp
                  </>
                )}
              </motion.span>
            </AnimatePresence>
            {status === "sending" && (
              <motion.span
                aria-hidden
                className="absolute bottom-0 left-0 h-1 w-full origin-left bg-brand-sky"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: "linear" }}
              />
            )}
          </button>
          <p className="mt-3 text-xs text-brand-muted">Ao enviar, abrirá uma conversa de WhatsApp com os dados preenchidos.</p>
        </form>
      </div>
    </Section>
  );
}
