/** ===== Galeria (carrossel) — configuração =====
 * As imagens vêm da pasta do Google Drive através da função /api/gallery (ver docs/GALERIA-GOOGLE-DRIVE.md).
 * O ID da pasta e a chave da API ficam SÓ no Netlify (variáveis GOOGLE_DRIVE_FOLDER_ID / GOOGLE_DRIVE_API_KEY). Nada secreto aqui.
 */
export const GALLERY = {
  /** Pasta usada por omissão no servidor (referência; o valor efectivo pode ser mudado com GOOGLE_DRIVE_FOLDER_ID). */
  folderId: "12zbmp1k38-RQZvwSzgCZT-GJDBFF-_pL",
  endpoint: "/api/gallery",
  /** Máximo de imagens mostradas (o servidor também limita; ver GALLERY_MAX_IMAGES). */
  maxImages: 24,
  /** Quantas imagens aparecem em simultâneo. */
  slidesPerView: { mobile: 1, tablet: 2, desktop: 3 },
  /** "contain" mostra a imagem inteira; "cover" preenche e corta; "auto" usa cover só se a proporção for parecida com a moldura. */
  fit: "auto" as "auto" | "cover" | "contain",
  /** Proporção da moldura (largura/altura). 0.8 = 4:5, como as publicações do Instagram. */
  frameRatio: 0.8,
  /** Cache local: usar resultado guardado durante este tempo; depois revalidar (e mostrar o guardado se a rede falhar). */
  cacheTtlMs: 10 * 60 * 1000,
  /** Verificar novas imagens enquanto a página está aberta e visível. */
  refreshMs: 5 * 60 * 1000,
  fetchTimeoutMs: 8000,
  /** Alternativa estática se a API não estiver disponível: copiar ficheiros para public/images/carousel/ e listar aqui. */
  fallback: [] as { src: string; alt: string; width?: number; height?: number }[],
};
