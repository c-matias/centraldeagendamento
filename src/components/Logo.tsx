import { SITE } from "../config/site";

export const Logo = ({ light = false, href = "#inicio" }: { light?: boolean; href?: string }) => (
  <a
    href={href}
    aria-label={`${SITE.name} – início`}
    className={`flex items-center gap-2.5 font-serif text-lg font-bold ${light ? "text-white" : "text-fg-brand"}`}
  >
    <img
      src="/images/logo.png"
      alt=""
      width={48}
      height={48}
      className={`h-10 w-10 rounded-full object-contain sm:h-12 sm:w-12 dark:bg-white ${light ? "bg-white" : ""}`}
    />
    <span className={light ? "" : "max-w-[9rem] text-base leading-tight sm:max-w-none sm:text-lg xl:hidden 2xl:inline"}>{SITE.name}</span>
  </a>
);
