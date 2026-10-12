import carouselFiles from "virtual:carousel-images";
import { Instagram } from "lucide-react";
import { useCallback, useState } from "react";
import { SITE } from "../config/site";
import { fitFor, type GalleryItem, toItems } from "../lib/gallery";
import { track } from "../observability";
import Carousel from "./Carousel";
import Lightbox from "./Lightbox";
import { LazyImage } from "./media";
import { Button, Section } from "./ui";

/** Imagens de public/images/carousel/, descobertas no build (sem API nem chaves). */
const ITEMS = toItems(carouselFiles);

const FRAME = "relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-brand-line bg-brand-soft shadow-card";

function Slide({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  const fit = fitFor(item);
  return (
    <button type="button" onClick={onOpen} aria-label={`Ampliar imagem: ${item.alt}`} className={`${FRAME} group block text-left`}>
      {fit === "contain" && (
        <img
          src={item.src}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
        />
      )}
      <LazyImage
        src={item.src}
        alt={item.alt}
        width={item.width}
        height={item.height}
        fallbackLabel="Imagem indisponível"
        className="absolute inset-0"
        imgClassName={`transition-transform duration-500 ease-out group-hover:scale-[1.02] ${fit === "contain" ? "!object-contain" : ""}`}
      />
    </button>
  );
}

function Message({ children, action }: { children: string; action?: React.ReactNode }) {
  return (
    <div role="status" className="mx-auto mt-10 max-w-xl rounded-2xl border border-brand-line bg-white p-6 text-center shadow-card">
      <p className="text-brand-muted">{children}</p>
      {action && <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">{action}</div>}
    </div>
  );
}

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const onSlideChange = useCallback((i: number) => i > 0 && track("gallery_nav"), []);
  const instagram = (
    <Button variant="outline" href={SITE.social.instagram.url} target="_blank" rel="noopener">
      <Instagram size={18} aria-hidden /> Ver no Instagram
    </Button>
  );

  return (
    <Section
      id="galeria"
      eyebrow="Galeria"
      title="Galeria da Central de Agendamento"
      lead="Conheça um pouco mais do nosso trabalho e acompanhe as nossas publicações."
    >
      <div className="mt-8 md:mt-10">
        {ITEMS.length > 0 ? (
          <>
            <Carousel
              label="Galeria de imagens"
              onSlideChange={onSlideChange}
              slides={ITEMS.map((it, i) => (
                <Slide
                  key={it.id}
                  item={it}
                  onOpen={() => {
                    track("gallery_open");
                    setOpen(i);
                  }}
                />
              ))}
            />
            <Lightbox items={ITEMS} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
            <div className="mt-8 text-center">{instagram}</div>
          </>
        ) : (
          <Message action={instagram}>Ainda não há publicações na galeria. Acompanhe-nos nas redes sociais.</Message>
        )}
      </div>
    </Section>
  );
}
