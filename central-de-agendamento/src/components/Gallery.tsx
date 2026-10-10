import { Instagram, RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { GALLERY } from "../config/gallery";
import { SITE } from "../config/site";
import { fitFor, type GalleryItem, SIZES } from "../lib/gallery";
import { track } from "../observability";
import Carousel from "./Carousel";
import Lightbox from "./Lightbox";
import { LazyImage, Skeleton } from "./media";
import { Button, Section } from "./ui";
import { useGallery } from "./useGallery";

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
        srcSet={item.srcSet}
        sizes={SIZES}
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
  const g = useGallery();
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
      <div className="mt-8 md:mt-10" aria-busy={g.status === "loading"}>
        {g.status === "loading" && (
          <div className="flex gap-4">
            <span className="sr-only">A carregar a galeria…</span>
            {[0, 1, 2].map((k) => (
              <div key={k} className={`${k > 0 ? "hidden sm:block" : ""} ${k > 1 ? "!hidden lg:!block" : ""} w-full`}>
                <Skeleton className={`${FRAME} !rounded-2xl`} />
              </div>
            ))}
          </div>
        )}
        {g.status === "ready" && (
          <>
            <Carousel
              label="Galeria de imagens"
              onSlideChange={onSlideChange}
              slides={g.items.slice(0, GALLERY.maxImages).map((it, i) => (
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
            <Lightbox items={g.items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
            <div className="mt-8 text-center">{instagram}</div>
          </>
        )}
        {g.status === "empty" && (
          <Message action={instagram}>Ainda não há publicações na galeria. Acompanhe-nos nas redes sociais.</Message>
        )}
        {g.status === "error" && (
          <Message
            action={
              <>
                <button
                  type="button"
                  onClick={g.retry}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-brand px-6 py-3 font-semibold text-brand transition duration-150 hover:bg-brand-soft active:scale-[0.98]"
                >
                  <RefreshCw size={16} aria-hidden /> Tentar novamente
                </button>
                {instagram}
              </>
            }
          >
            Não foi possível carregar a galeria neste momento. Pode ver as nossas publicações nas redes sociais.
          </Message>
        )}
      </div>
    </Section>
  );
}
