// Princípios (skill design-motion-principles): ponderação Jakub (polimento) + Jhey (detalhes) + Emil (formulários/menu).
// Só transform / opacity / filter. Entradas: opacity + translateY + blur. Saídas mais subtis e rápidas. Springs com bounce 0.
export const SPRING = { type: "spring" as const, duration: 0.45, bounce: 0 };
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const hidden = { opacity: 0, y: 8, filter: "blur(4px)" };
export const shown = { opacity: 1, y: 0, filter: "blur(0px)" };
export const leave = { opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.18, ease: EASE_OUT } };
export const revealProps = (delay = 0) => ({
  initial: hidden,
  whileInView: shown,
  viewport: { once: true, margin: "-60px" },
  transition: { ...SPRING, delay },
});
