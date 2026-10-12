import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef } from "react";
import type { GalleryItem } from "../lib/gallery";

type Props = { items: GalleryItem[]; index: number | null; onIndex: (i: number) => void; onClose: () => void };

/** Vista da imagem completa (sem cortes), em <dialog> nativo: foco preso, Esc fecha, ←/→ navegam. */
export default function Lightbox({ items, index, onIndex, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const item = index === null ? null : items[index];
  const go = (d: number) => index !== null && onIndex((index + d + items.length) % items.length);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  };
  const btn =
    "grid h-11 w-11 place-items-center rounded-full bg-white/90 text-brand transition duration-150 hover:bg-white active:scale-95";

  return (
    <dialog
      ref={ref}
      aria-label="Imagem ampliada"
      onClose={onClose}
      onKeyDown={onKey}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 backdrop:bg-brand-dark/90"
    >
      {item && (
        <div className="lightbox-in relative flex h-full w-full items-center justify-center p-4 sm:p-10">
          <img key={item.id} src={item.full} alt={item.alt} className="max-h-full max-w-full rounded-xl object-contain shadow-card" />
          <button type="button" aria-label="Fechar" onClick={onClose} className={`absolute right-3 top-3 sm:right-6 sm:top-6 ${btn}`}>
            <X size={22} />
          </button>
          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Imagem anterior"
                onClick={() => go(-1)}
                className={`absolute left-3 top-1/2 -translate-y-1/2 sm:left-6 ${btn}`}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                aria-label="Imagem seguinte"
                onClick={() => go(1)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 sm:right-6 ${btn}`}
              >
                <ChevronRight size={22} />
              </button>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-sm text-brand">
                {(index ?? 0) + 1} / {items.length}
              </p>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
