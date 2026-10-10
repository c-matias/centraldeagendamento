import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Skeleton = ({ className = "" }: { className?: string }) => <div aria-hidden className={`skeleton rounded-xl ${className}`} />;

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  srcSet?: string;
  sizes?: string;
  /** Texto mostrado se a imagem falhar (por omissão a imagem fica só vazia). */
  fallbackLabel?: string;
};

/** Imagem com skeleton enquanto carrega, lazy-loading nativo, entrada suave (opacity + blur) e estado de falha. */
export function LazyImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  priority = false,
  width,
  height,
  srcSet,
  sizes,
  fallbackLabel,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    setFailed(false);
    setLoaded(Boolean(ref.current?.complete && ref.current.naturalWidth > 0));
  }, [src]);
  return (
    <div className={`${/\b(absolute|fixed|relative|sticky)\b/.test(className) ? "" : "relative"} overflow-hidden ${className}`}>
      {!loaded && !failed && <Skeleton className="absolute inset-0 !rounded-none" />}
      {failed ? (
        <div
          role="img"
          aria-label={fallbackLabel ?? alt}
          className="absolute inset-0 grid place-items-center bg-brand-soft text-brand-muted"
        >
          <span className="flex flex-col items-center gap-2 px-4 text-center text-xs">
            <ImageOff size={22} aria-hidden />
            {fallbackLabel ?? "Imagem indisponível"}
          </span>
        </div>
      ) : (
        <img
          ref={ref}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...(priority ? ({ fetchpriority: "high" } as Record<string, string>) : {})}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-[opacity,filter] duration-500 ease-out ${loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"} ${imgClassName}`}
        />
      )}
    </div>
  );
}
