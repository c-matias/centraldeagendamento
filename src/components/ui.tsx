import { motion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";
import { revealProps } from "../lib/motion";
import { track } from "../observability";

export const Container = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`mx-auto max-w-6xl px-5 ${className}`}>{children}</div>
);

export const Reveal = ({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => (
  <motion.div className={className} {...revealProps(delay)}>
    {children}
  </motion.div>
);

const variants = {
  primary: "bg-brand text-white hover:bg-brand-royal",
  outline: "border-2 border-fg-brand text-fg-brand hover:bg-brand-soft",
  light: "bg-white text-brand-dark hover:bg-[#EAF0FF]",
  ghostLight: "border-2 border-white text-white hover:bg-white/10",
};
type Props = ComponentProps<"a"> & { variant?: keyof typeof variants };
export const Button = ({ variant = "primary", className = "", onClick, href, ...p }: Props) => (
  <a
    {...p}
    href={href}
    onClick={(e) => {
      if (href?.includes("wa.me")) track("cta_whatsapp");
      onClick?.(e);
    }}
    className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-center font-semibold leading-snug sm:w-auto transition duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-card active:translate-y-0 active:scale-[0.98] ${variants[variant]} ${className}`}
  />
);

export const Section = ({
  id,
  eyebrow,
  title,
  lead,
  children,
  className = "",
  center = true,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  className?: string;
  center?: boolean;
}) => (
  <section id={id} className={`py-14 md:py-20 ${className}`}>
    <Container>
      <Reveal className={center ? "text-center" : ""}>
        {eyebrow && <p className="mb-3 text-sm font-semibold text-fg-royal">{eyebrow}</p>}
        <h2 className="text-3xl text-fg-brand md:text-4xl">{title}</h2>
        {lead && <p className={`mt-3 max-w-xl text-lg text-brand-muted ${center ? "mx-auto" : ""}`}>{lead}</p>}
      </Reveal>
      {children}
    </Container>
  </section>
);
