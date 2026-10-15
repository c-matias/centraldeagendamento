import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { getTheme, subscribe, type Theme, toggleTheme } from "../lib/theme";

/** Botão sol/lua: sol no modo claro, lua no modo escuro. A descrição acessível indica a acção. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getTheme, (): Theme => "light");
  const dark = theme === "dark";
  const label = dark ? "Activar modo claro" : "Activar modo escuro";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-line bg-surface text-fg-brand transition duration-150 hover:border-fg-royal hover:bg-brand-soft active:scale-95 ${className}`}
    >
      {dark ? <Moon size={20} aria-hidden /> : <Sun size={20} aria-hidden />}
    </button>
  );
}
