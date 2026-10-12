import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV } from "../config/site";
import { EASE_OUT, hidden, leave, SPRING, shown } from "../lib/motion";
import { waLink } from "../lib/whatsapp";
import { Logo } from "./Logo";
import { Button, Container } from "./ui";

/** `basePath=""` na landing (âncoras locais); `basePath="/"` nas páginas jurídicas (âncoras apontam para a landing). */
export default function Navbar({ basePath = "" }: { basePath?: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(basePath ? "" : NAV[0][1]);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  // a mola pode ultrapassar 1 por instantes: limitar a [0,1] evita que a barra crie scroll horizontal
  const bar = useTransform(progress, (v) => Math.min(Math.max(v, 0), 1));

  useEffect(() => {
    const spy = () => {
      if (basePath) return;
      const y = window.scrollY + 120;
      let cur: string = NAV[0][1];
      NAV.forEach(([, h]) => {
        const el = document.querySelector<HTMLElement>(h);
        if (el && el.offsetTop <= y) cur = h;
      });
      setActive(cur);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width:1280px)");
    const close = () => setOpen(false);
    spy();
    window.addEventListener("scroll", spy, { passive: true });
    window.addEventListener("keydown", esc);
    mq.addEventListener("change", close);
    return () => {
      window.removeEventListener("scroll", spy);
      window.removeEventListener("keydown", esc);
      mq.removeEventListener("change", close);
    };
  }, [basePath]);

  const linkCls = (href: string) =>
    `whitespace-nowrap transition-colors duration-150 hover:text-brand ${active === href ? "text-brand underline decoration-brand-royal decoration-2 underline-offset-8" : "text-brand-muted"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-line bg-white/90 backdrop-blur">
      <Container className="relative flex h-[70px] items-center justify-between">
        <Logo href={basePath || "#inicio"} />
        <nav aria-label="Principal" className="hidden items-center gap-7 xl:flex">
          {NAV.map(([label, href]) => (
            <a
              key={href}
              href={`${basePath}${href}`}
              aria-current={active === href ? "true" : undefined}
              className={`text-sm ${linkCls(href)}`}
            >
              {label}
            </a>
          ))}
          <Button href={waLink()} target="_blank" rel="noopener" className="!px-5 !py-2.5">
            Agendar atendimento
          </Button>
        </nav>
        <button
          type="button"
          className="p-2 active:scale-95 xl:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <AnimatePresence>
          {open && (
            <motion.nav
              id="menu-mobile"
              aria-label="Principal"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_OUT } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.16, ease: EASE_OUT } }}
              className="absolute left-0 right-0 top-full flex flex-col border-b border-brand-line bg-white px-5 pb-5 shadow-card xl:hidden"
            >
              {NAV.map(([label, href], i) => (
                <motion.a
                  key={href}
                  href={`${basePath}${href}`}
                  onClick={() => setOpen(false)}
                  aria-current={active === href ? "true" : undefined}
                  initial={hidden}
                  animate={{ ...shown, transition: { ...SPRING, delay: 0.03 * i } }}
                  className={`border-b border-brand-line py-3.5 ${linkCls(href)}`}
                >
                  {label}
                </motion.a>
              ))}
              <motion.div initial={hidden} animate={{ ...shown, transition: { ...SPRING, delay: 0.03 * NAV.length } }} exit={leave}>
                <Button href={waLink()} target="_blank" rel="noopener" className="mt-4">
                  Agendar atendimento
                </Button>
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </Container>
      {/* progresso de leitura da página (clipado: nunca excede a largura do ecrã) */}
      <div aria-hidden className="absolute inset-x-0 bottom-[-1px] h-0.5 overflow-hidden">
        <motion.div style={{ scaleX: bar }} className="h-full w-full origin-left bg-brand-royal" />
      </div>
    </header>
  );
}
