/** Cores da marca: substituir pelos HEX oficiais */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#101070",
          dark: "#000A60",
          royal: "#2350D9",
          sky: "#7FB0FF",
          soft: "#F5F7FA",
          ink: "#14202E",
          muted: "#5A6B7C",
          line: "#E1E6EF",
        },
      },
      fontFamily: { serif: ["Georgia", "Times New Roman", "serif"], sans: ["Inter", "system-ui", "sans-serif"] },
      boxShadow: { card: "0 8px 30px rgba(16,16,112,.10)" },
    },
  },
  plugins: [],
};
