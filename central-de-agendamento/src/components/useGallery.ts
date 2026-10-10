import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY } from "../config/gallery";
import { type GalleryItem, isFresh, parseGallery, readCache, writeCache } from "../lib/gallery";
import { captureError } from "../observability";

export type GalleryState =
  | { status: "loading"; items: [] }
  | { status: "ready"; items: GalleryItem[]; source: "api" | "cache" | "fallback" }
  | { status: "empty"; items: [] }
  | { status: "error"; items: []; reason: "not_configured" | "unavailable" };

async function load(): Promise<GalleryItem[]> {
  const res = await fetch(GALLERY.endpoint, {
    signal: AbortSignal.timeout(GALLERY.fetchTimeoutMs),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw Object.assign(new Error(`galeria ${res.status}`), { code: body?.error ?? "unavailable" });
  }
  return parseGallery(await res.json());
}

/**
 * Ordem: cache fresca → API → (rede falha) cache antiga → alternativa estática → erro discreto.
 * Revalida quando o separador volta a ficar visível e periodicamente enquanto a página está aberta.
 */
export function useGallery(): GalleryState & { retry: () => void } {
  const [state, setState] = useState<GalleryState>(() => {
    const c = readCache();
    return c?.items.length ? { status: "ready", items: c.items, source: "cache" } : { status: "loading", items: [] };
  });
  const have = useRef(state.items.length > 0);
  have.current = state.items.length > 0;

  const refresh = useCallback(async (force = false) => {
    const cached = readCache();
    if (!force && isFresh(cached) && cached?.items.length) return;
    try {
      const items = await load();
      writeCache(items);
      setState(
        items.length
          ? { status: "ready", items, source: "api" }
          : GALLERY.fallback.length
            ? fallbackState()
            : { status: "empty", items: [] },
      );
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code !== "not_configured") captureError(e, { where: "gallery" });
      if (have.current) return; // mantém o que já está no ecrã (cache), sem avisos
      const old = readCache();
      if (old?.items.length) setState({ status: "ready", items: old.items, source: "cache" });
      else if (GALLERY.fallback.length) setState(fallbackState());
      else setState({ status: "error", items: [], reason: code === "not_configured" ? "not_configured" : "unavailable" });
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onVisible = () => document.visibilityState === "visible" && void refresh();
    document.addEventListener("visibilitychange", onVisible);
    const t = setInterval(() => document.visibilityState === "visible" && void refresh(true), GALLERY.refreshMs);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(t);
    };
  }, [refresh]);

  const retry = useCallback(() => {
    setState({ status: "loading", items: [] });
    void refresh(true);
  }, [refresh]);

  return { ...state, retry } as GalleryState & { retry: () => void };
}

function fallbackState(): GalleryState {
  const items = GALLERY.fallback.map((f, i) => ({
    id: `fallback-${i}`,
    alt: f.alt,
    src: f.src,
    full: f.src,
    width: f.width,
    height: f.height,
  }));
  return { status: "ready", items, source: "fallback" };
}
