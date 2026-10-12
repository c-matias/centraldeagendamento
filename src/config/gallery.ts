/** ===== Galeria (carrossel) — configuração =====
 * As imagens vêm da pasta do próprio projecto: public/images/carousel/ (JPG, JPEG, PNG ou WebP).
 * Não há API, chaves nem variáveis de ambiente. A lista é descoberta automaticamente no build
 * (vite-plugins/site-assets.ts): basta adicionar ficheiros à pasta e fazer deploy. Ver docs/GALERIA-CARROSSEL.md.
 */
export const GALLERY = {
  /** Caminho público das imagens (corresponde a public/images/carousel/). */
  publicPath: "/images/carousel",
  /** Máximo de imagens mostradas. */
  maxImages: 24,
  /** Quantas imagens aparecem em simultâneo. */
  slidesPerView: { mobile: 1, tablet: 2, desktop: 3 },
  /** "contain" mostra a imagem inteira; "cover" preenche e corta; "auto" usa cover só se a proporção for parecida com a moldura. */
  fit: "auto" as "auto" | "cover" | "contain",
  /** Proporção da moldura (largura/altura). 0.8 = 4:5, como as publicações do Instagram. */
  frameRatio: 0.8,
};
