/** Cores da marca como CSS variables (valores em src/index.css, claro e escuro). Substituir pelos HEX oficiais lá. */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: v("page"), // fundo da página
        surface: v("surface"), // cartões, menus, campos
        // cor de TEXTO/contorno de destaque (no modo escuro fica clara; os fundos `brand`/`brand-royal` mantêm-se azuis)
        fg: { brand: v("fg-brand"), royal: v("fg-royal") },
        brand: {
          DEFAULT: v("brand"),
          dark: v("brand-dark"),
          royal: v("royal"),
          sky: v("sky"),
          soft: v("soft"),
          ink: v("ink"),
          muted: v("muted"),
          line: v("line"),
        },
      },
      fontFamily: { serif: ["Georgia", "Times New Roman", "serif"], sans: ["Inter", "system-ui", "sans-serif"] },
      boxShadow: { card: "var(--shadow-card)" },
    },
  },
  plugins: [],
};
