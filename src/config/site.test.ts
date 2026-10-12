import { describe, expect, it } from "vitest";
import { FAQ, FORM_TYPES, NAV, PACKAGES, SERVICES, SITE, STEPS, TESTIMONIALS } from "./site";

describe("conteúdo do site", () => {
  it("contactos oficiais válidos", () => {
    expect(SITE.phone).toMatch(/^\+?\d{9,15}$/);
    expect(SITE.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    for (const s of Object.values(SITE.social)) expect(s.url).toMatch(/^https:\/\//);
  });
  it("navegação aponta para âncoras únicas", () => {
    const hrefs = NAV.map(([, h]) => h);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const h of hrefs) expect(h).toMatch(/^#[a-z]+$/);
  });
  it("tem os 5 pacotes e só o Completo em destaque", () => {
    expect(PACKAGES.map((p) => p.name)).toEqual([
      "Pacote Essencial",
      "Pacote Seguro",
      "Pacote Agendamento",
      "Pacote Documentação",
      "Pacote Completo",
    ]);
    expect(PACKAGES.filter((p) => p.highlight).map((p) => p.name)).toEqual(["Pacote Completo"]);
  });
  it("preços reais dos pacotes (Kz)", () => {
    expect(Object.fromEntries(PACKAGES.map((p) => [p.name, p.price]))).toEqual({
      "Pacote Essencial": "25.000 Kz",
      "Pacote Seguro": "50.000 Kz",
      "Pacote Agendamento": "130.000 Kz",
      "Pacote Documentação": "350.000 Kz",
      "Pacote Completo": "400.000 Kz",
    });
  });
  it("Pacote Completo contém todos os serviços dos outros pacotes", () => {
    const completo = new Set(PACKAGES.at(-1)?.items);
    for (const p of PACKAGES) for (const i of p.items) expect(completo.has(i)).toBe(true);
  });
  it("estrutura mínima", () => {
    expect(SERVICES).toHaveLength(5);
    expect(STEPS).toHaveLength(5);
    expect(FAQ.length).toBeGreaterThan(0);
    expect(FORM_TYPES.length).toBeGreaterThan(0);
    for (const t of TESTIMONIALS) expect(t.stars).toBeGreaterThanOrEqual(1);
  });
  it("FAQ de transparência presente", () => {
    const qs = FAQ.map(([q]) => q).join(" ");
    expect(qs).toMatch(/Consulado/);
    expect(qs).toMatch(/aprovação/);
  });
});
