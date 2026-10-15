export type Theme = "light" | "dark";

export const THEME_KEY = "ca:theme";
const META_COLOR: Record<Theme, string> = { light: "#101070", dark: "#0A1020" };

const listeners = new Set<() => void>();
const notify = () => {
  for (const l of listeners) l();
};

/** Preferência guardada (ou null). Nunca falha se o armazenamento estiver bloqueado. */
export function readStoredTheme(storage: Pick<Storage, "getItem"> | undefined = safeStorage()): Theme | null {
  try {
    const v = storage?.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

/** Preferência guardada; na primeira visita, a do sistema operativo. */
export const resolveTheme = (stored: Theme | null, prefersDark: boolean): Theme => stored ?? (prefersDark ? "dark" : "light");

export const getTheme = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => void listeners.delete(cb);
}

/** Aplica o tema ao <html>. `animate` activa uma transição curta de cores (evita mudanças bruscas). */
export function applyTheme(theme: Theme, animate = false): void {
  const root = document.documentElement;
  if (animate && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 300);
  }
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLOR[theme]);
  notify();
}

export function setTheme(theme: Theme, storage: Pick<Storage, "setItem"> | undefined = safeStorage()): void {
  applyTheme(theme, true);
  try {
    storage?.setItem(THEME_KEY, theme);
  } catch {
    /* sem armazenamento: o tema aplica-se na mesma, só não persiste */
  }
}

export const toggleTheme = (): void => setTheme(getTheme() === "dark" ? "light" : "dark");

/**
 * Arranque: aplica o tema inicial (o script do <head> já o fez antes da pintura; aqui só se garante e se ligam os ouvintes).
 * Sem escolha guardada, acompanha o sistema; com várias abas abertas, mantém-nas sincronizadas.
 */
export function initTheme(): () => void {
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  applyTheme(resolveTheme(readStoredTheme(), Boolean(mq?.matches)));
  const onSystem = (e: MediaQueryListEvent) => {
    if (!readStoredTheme()) applyTheme(e.matches ? "dark" : "light", true);
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY) applyTheme(resolveTheme(readStoredTheme(), Boolean(mq?.matches)), true);
  };
  mq?.addEventListener?.("change", onSystem);
  window.addEventListener("storage", onStorage);
  return () => {
    mq?.removeEventListener?.("change", onSystem);
    window.removeEventListener("storage", onStorage);
  };
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
