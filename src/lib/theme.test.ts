import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme, getTheme, initTheme, readStoredTheme, resolveTheme, setTheme, subscribe, THEME_KEY, toggleTheme } from "./theme";

const root = document.documentElement;
const meta = () => document.querySelector('meta[name="theme-color"]');

function mockMatchMedia(prefersDark: boolean, reduced = false) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mm = vi.fn((q: string) => ({
    matches: q.includes("reduce") ? reduced : q.includes("dark") ? prefersDark : false,
    media: q,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
  }));
  vi.stubGlobal("matchMedia", mm);
  return {
    emit: (matches: boolean) => {
      for (const l of listeners) l({ matches } as MediaQueryListEvent);
    },
    size: () => listeners.size,
  };
}

beforeEach(() => {
  document.head.innerHTML = '<meta name="theme-color" content="#101070" />';
  root.className = "";
  root.removeAttribute("style");
  localStorage.clear();
  mockMatchMedia(false);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("resolveTheme / readStoredTheme", () => {
  it("a preferência guardada ganha; sem ela, vale a do sistema operativo", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });
  it("só aceita 'light' | 'dark'; lixo ou armazenamento bloqueado → null", () => {
    expect(readStoredTheme({ getItem: () => "dark" })).toBe("dark");
    expect(readStoredTheme({ getItem: () => "light" })).toBe("light");
    expect(readStoredTheme({ getItem: () => "azul" })).toBeNull();
    expect(readStoredTheme({ getItem: () => null })).toBeNull();
    expect(
      readStoredTheme({
        getItem: () => {
          throw new Error("bloqueado");
        },
      }),
    ).toBeNull();
    expect(readStoredTheme(undefined)).toBeNull();
  });
});

describe("applyTheme / setTheme / toggleTheme", () => {
  it("aplica a classe, o color-scheme e a cor da barra do browser", () => {
    applyTheme("dark");
    expect(getTheme()).toBe("dark");
    expect(root.classList.contains("dark")).toBe(true);
    expect(root.style.colorScheme).toBe("dark");
    expect(meta()?.getAttribute("content")).toBe("#0A1020");
    applyTheme("light");
    expect(getTheme()).toBe("light");
    expect(root.classList.contains("dark")).toBe(false);
    expect(meta()?.getAttribute("content")).toBe("#101070");
  });
  it("alterna imediatamente e guarda a preferência no localStorage", () => {
    toggleTheme();
    expect(getTheme()).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    toggleTheme();
    expect(getTheme()).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
  });
  it("se o armazenamento falhar, o tema aplica-se na mesma", () => {
    setTheme("dark", {
      setItem: () => {
        throw new Error("cheio");
      },
    });
    expect(getTheme()).toBe("dark");
  });
  it("notifica os subscritores (os dois botões ficam sincronizados) e cancela a subscrição", () => {
    const cb = vi.fn();
    const off = subscribe(cb);
    applyTheme("dark");
    expect(cb).toHaveBeenCalledTimes(1);
    off();
    applyTheme("light");
    expect(cb).toHaveBeenCalledTimes(1);
  });
  it("transição suave só durante a troca (300 ms) e desligada com 'reduzir movimento'", () => {
    vi.useFakeTimers();
    applyTheme("dark", true);
    expect(root.classList.contains("theme-transition")).toBe(true);
    vi.advanceTimersByTime(350);
    expect(root.classList.contains("theme-transition")).toBe(false);
    mockMatchMedia(false, true);
    applyTheme("light", true);
    expect(root.classList.contains("theme-transition")).toBe(false);
  });
});

describe("initTheme", () => {
  it("1.ª visita: respeita o sistema (escuro) sem guardar nada", () => {
    mockMatchMedia(true);
    initTheme();
    expect(getTheme()).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });
  it("1.ª visita: sistema claro → claro", () => {
    initTheme();
    expect(getTheme()).toBe("light");
  });
  it("a escolha guardada ganha ao sistema", () => {
    mockMatchMedia(true);
    localStorage.setItem(THEME_KEY, "light");
    initTheme();
    expect(getTheme()).toBe("light");
  });
  it("sem escolha guardada acompanha as mudanças do sistema; com escolha, ignora-as", () => {
    const mm = mockMatchMedia(false);
    const stop = initTheme();
    mm.emit(true);
    expect(getTheme()).toBe("dark");
    mm.emit(false);
    expect(getTheme()).toBe("light");
    localStorage.setItem(THEME_KEY, "light");
    mm.emit(true);
    expect(getTheme()).toBe("light");
    stop();
    expect(mm.size()).toBe(0);
  });
  it("sincroniza com outras abas (evento storage)", () => {
    const stop = initTheme();
    localStorage.setItem(THEME_KEY, "dark");
    window.dispatchEvent(new StorageEvent("storage", { key: THEME_KEY }));
    expect(getTheme()).toBe("dark");
    window.dispatchEvent(new StorageEvent("storage", { key: "outra-chave" }));
    expect(getTheme()).toBe("dark");
    stop();
  });
});
