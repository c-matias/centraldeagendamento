import { describe, expect, it } from "vitest";
import { SITE } from "../config/site";
import { waLink } from "./whatsapp";

describe("waLink", () => {
  it("usa o número oficial e a mensagem por omissão codificada", () => {
    const url = new URL(waLink());
    expect(url.origin + url.pathname).toBe(`https://wa.me/${SITE.phone.replace(/\D/g, "")}`);
    expect(url.searchParams.get("text")).toBe(SITE.whatsappMessage);
  });
  it("o número no link só tem dígitos (formato wa.me)", () => {
    expect(new URL(waLink()).pathname).toMatch(/^\/\d+$/);
  });
  it("codifica mensagens personalizadas (acentos, espaços, &)", () => {
    const url = waLink("Olá & bem-vindo #1");
    expect(url).toContain("text=Ol%C3%A1%20%26%20bem-vindo%20%231");
  });
});
