import { type ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { Skeleton } from "./media";
import { Container } from "./ui";

const SK_KEYS = ["a", "b", "c", "d"];

/** Teclado: ao primeiro Tab (ou após um período ocioso) todas as secções são montadas, para que o foco as alcance. */
const MOUNT_ALL = "deferred:mount-all";
const IDLE_MS = 8000;
let armed = false;
function armMountAll() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const fire = () => window.dispatchEvent(new Event(MOUNT_ALL));
  window.addEventListener("keydown", (e) => e.key === "Tab" && fire(), { once: true });
  setTimeout(fire, IDLE_MS);
}
export const __resetDeferredForTests = () => {
  armed = false;
};

type SkProps = { id?: string; minH?: string; cards?: number; header?: boolean };

export function SectionSkeleton({ id, minH = "28rem", cards = 3, header = true }: SkProps) {
  return (
    <section id={id} aria-busy="true" aria-label="A carregar" className="py-14 md:py-20" style={{ minHeight: minH }}>
      <Container>
        {header && (
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}
        {cards > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {SK_KEYS.slice(0, cards).map((k) => (
              <Skeleton key={k} className="h-48 !rounded-2xl" />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

/** Só carrega o código e monta a secção quando está perto do ecrã; entretanto mostra skeleton (mantém o id para âncoras). */
export default function Deferred({ children, ...sk }: SkProps & { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(() => !!sk.id && window.location.hash === `#${sk.id}`); // link directo para a secção monta-a logo
  useEffect(() => {
    if (show) return;
    armMountAll();
    const all = () => setShow(true);
    window.addEventListener(MOUNT_ALL, all);
    return () => window.removeEventListener(MOUNT_ALL, all);
  }, [show]);
  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    if (!("IntersectionObserver" in window)) {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);
  return <div ref={ref}>{show ? <Suspense fallback={<SectionSkeleton {...sk} />}>{children}</Suspense> : <SectionSkeleton {...sk} />}</div>;
}
