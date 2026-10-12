import priceTable from "virtual:price-table";
import { ExternalLink, ZoomIn } from "lucide-react";
import { useState } from "react";
import { waLink } from "../lib/whatsapp";
import { track } from "../observability";
import Lightbox from "./Lightbox";
import { LazyImage } from "./media";
import { Button, Reveal, Section } from "./ui";

const ALT = "Tabela de preços dos serviços da Central de Agendamento";

/**
 * Mostra a imagem public/images/tabela-precos.(jpg|jpeg|png|webp), inteira e sem cortes.
 * A tabela NÃO é reproduzida em HTML: é a imagem original. Se o ficheiro ainda não existir, a secção não aparece.
 */
export default function PriceTable() {
  const [open, setOpen] = useState<number | null>(null);
  if (!priceTable) return null;
  const src = `/images/${encodeURIComponent(priceTable.file)}`;
  const items = [{ id: "tabela-precos", alt: ALT, src, full: src, width: priceTable.width, height: priceTable.height }];
  const ratio = priceTable.width && priceTable.height ? priceTable.width / priceTable.height : 3 / 4;

  return (
    <Section
      id="precos"
      eyebrow="Preços"
      title="Tabela de Preços"
      lead="Consulte a tabela com os valores dos nossos serviços. Para esclarecer dúvidas, fale connosco pelo WhatsApp."
    >
      <Reveal className="mx-auto mt-8 max-w-4xl md:mt-10">
        <button
          type="button"
          onClick={() => {
            track("price_table_open");
            setOpen(0);
          }}
          aria-label="Ampliar a tabela de preços"
          className="group relative block w-full cursor-zoom-in rounded-2xl border border-brand-line bg-white p-2 text-left shadow-card transition duration-150 hover:border-brand-royal sm:p-3"
        >
          <LazyImage
            src={src}
            alt={ALT}
            width={priceTable.width}
            height={priceTable.height}
            fallbackLabel="Tabela de preços indisponível"
            className="w-full rounded-xl bg-brand-soft"
            imgClassName="!object-contain"
            style={{ aspectRatio: ratio }}
          />
          <span className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand shadow-card sm:text-sm">
            <ZoomIn size={16} aria-hidden /> Ampliar
          </span>
        </button>
        <p className="mt-3 text-center text-sm text-brand-muted">Toque ou clique na imagem para a ver ampliada.</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={waLink()} target="_blank" rel="noopener">
            Falar connosco no WhatsApp
          </Button>
          <Button variant="outline" href={src} target="_blank" rel="noopener">
            <ExternalLink size={16} aria-hidden /> Abrir imagem original
          </Button>
        </div>
      </Reveal>
      <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </Section>
  );
}
