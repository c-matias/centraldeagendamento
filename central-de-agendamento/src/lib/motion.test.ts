import { describe, expect, it } from "vitest";
import { EASE_OUT, hidden, leave, revealProps, SPRING, shown } from "./motion";

describe("motion", () => {
  it("spring de produção sem bounce", () => {
    expect(SPRING).toMatchObject({ type: "spring", bounce: 0 });
  });
  it("só anima transform/opacity/filter", () => {
    for (const s of [hidden, shown]) expect(Object.keys(s).sort()).toEqual(["filter", "opacity", "y"]);
  });
  it("saída mais rápida e subtil que a entrada", () => {
    expect(leave.transition.duration).toBeLessThan(SPRING.duration);
    expect(Math.abs(leave.y)).toBeLessThanOrEqual(Math.abs(hidden.y));
  });
  it("easing custom (não ease genérico)", () => {
    expect(EASE_OUT).toHaveLength(4);
  });
  it("revealProps respeita o atraso e anima só uma vez", () => {
    const p = revealProps(0.2);
    expect(p.transition.delay).toBe(0.2);
    expect(p.viewport.once).toBe(true);
    expect(revealProps().transition.delay).toBe(0);
  });
});
