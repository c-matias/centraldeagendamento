/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_DD_APPLICATION_ID?: string;
  readonly VITE_DD_CLIENT_TOKEN?: string;
  readonly VITE_DD_SITE?: string;
  readonly VITE_NR_LICENSE_KEY?: string;
  readonly VITE_NR_APPLICATION_ID?: string;
  readonly VITE_NR_ACCOUNT_ID?: string;
  readonly VITE_NR_TRUST_KEY?: string;
  readonly VITE_NR_AGENT_ID?: string;
  readonly VITE_OTEL_EXPORTER_URL?: string;
  readonly VITE_APP_ENV?: string;
}

declare module "virtual:carousel-images" {
  /** Gerado no build a partir de public/images/carousel/ (ver vite-plugins/site-assets.ts). */
  const images: { file: string; width?: number; height?: number }[];
  export default images;
}

declare module "virtual:price-table" {
  /** `null` enquanto public/images/tabela-precos.(jpg|jpeg|png|webp) não existir. */
  const image: { file: string; width?: number; height?: number } | null;
  export default image;
}
