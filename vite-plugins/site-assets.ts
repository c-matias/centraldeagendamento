import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { imageSize } from "image-size";
import type { Plugin } from "vite";

/**
 * Descobre, no momento do build, as imagens que estão DENTRO do projecto:
 *  - public/images/carousel/*  → carrossel da galeria (módulo virtual `virtual:carousel-images`)
 *  - public/images/tabela-precos.(jpg|jpeg|png|webp) → imagem da tabela de preços (módulo virtual `virtual:price-table`)
 * Não há API, chaves nem variáveis de ambiente: basta pôr os ficheiros na pasta e fazer deploy.
 */

type CarouselImage = { file: string; width?: number; height?: number };
type PriceTableImage = { file: string; width?: number; height?: number } | null;

const CAROUSEL_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const PRICE_NAMES = ["tabela-precos.jpg", "tabela-precos.jpeg", "tabela-precos.png", "tabela-precos.webp"];

const naturalCompare = (a: string, b: string) => a.localeCompare(b, "pt", { numeric: true, sensitivity: "base" });

function dims(path: string): { width?: number; height?: number } {
  try {
    const { width, height } = imageSize(readFileSync(path));
    return { width, height };
  } catch {
    return {}; // ficheiro corrompido ou formato não reconhecido: a imagem aparece na mesma, sem dimensões
  }
}

/** Lista os ficheiros JPG/JPEG/PNG/WebP da pasta (ordem natural dos nomes: 2 antes de 10). Ignora subpastas, ficheiros ocultos e outros formatos. */
export function scanCarousel(dir: string): CarouselImage[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && !e.name.startsWith(".") && CAROUSEL_EXT.includes(extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort(naturalCompare)
    .map((file) => ({ file, ...dims(join(dir, file)) }));
}

/** Procura `tabela-precos.jpg` (ou .jpeg/.png/.webp) na pasta. Devolve null se ainda não existir. */
export function findPriceTable(dir: string): PriceTableImage {
  const file = PRICE_NAMES.find((n) => existsSync(join(dir, n)));
  return file ? { file, ...dims(join(dir, file)) } : null;
}

const VIRTUAL = { carousel: "virtual:carousel-images", price: "virtual:price-table" } as const;

export function siteAssets(root = process.cwd()): Plugin {
  // ASSET_FIXTURES: só para os testes e2e (usa imagens de teste e copia-as para o build). Em produção não é definida.
  const fixtures = process.env.ASSET_FIXTURES ? resolve(root, process.env.ASSET_FIXTURES) : null;
  const carouselDir = fixtures ? join(fixtures, "carousel") : resolve(root, "public/images/carousel");
  const priceDir = fixtures ?? resolve(root, "public/images");
  const resolved = (id: string) => `\0${id}`;

  return {
    name: "site-assets",
    resolveId: (id) => (id === VIRTUAL.carousel || id === VIRTUAL.price ? resolved(id) : undefined),
    load(id) {
      if (id === resolved(VIRTUAL.carousel)) return `export default ${JSON.stringify(scanCarousel(carouselDir))};`;
      if (id === resolved(VIRTUAL.price)) return `export default ${JSON.stringify(findPriceTable(priceDir))};`;
    },
    configureServer(server) {
      // em desenvolvimento: ao adicionar/remover imagens, recarrega a página automaticamente
      server.watcher.add([carouselDir, priceDir]);
      const reload = (file: string) => {
        if (!file.startsWith(carouselDir) && !PRICE_NAMES.includes(basename(file))) return;
        for (const v of Object.values(VIRTUAL)) {
          const mod = server.moduleGraph.getModuleById(resolved(v));
          if (mod) server.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", reload).on("unlink", reload);
    },
    generateBundle() {
      if (!fixtures) return; // com imagens reais, o Vite já copia `public/` para o build
      for (const img of scanCarousel(carouselDir))
        this.emitFile({ type: "asset", fileName: `images/carousel/${img.file}`, source: readFileSync(join(carouselDir, img.file)) });
      const price = findPriceTable(priceDir);
      if (price) this.emitFile({ type: "asset", fileName: `images/${price.file}`, source: readFileSync(join(priceDir, price.file)) });
    },
  };
}
