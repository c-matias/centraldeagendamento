import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
const observers = new Set<{ cb: IOCallback; els: Set<Element> }>();

/** IntersectionObserver de teste: não dispara sozinho. Use `intersectAll()` para simular scroll até às secções. */
class MockIO {
  private rec: { cb: IOCallback; els: Set<Element> };
  constructor(cb: IOCallback) {
    this.rec = { cb, els: new Set() };
    observers.add(this.rec);
  }
  observe = (el: Element) => void this.rec.els.add(el);
  unobserve = (el: Element) => void this.rec.els.delete(el);
  disconnect = () => void observers.delete(this.rec);
  takeRecords = () => [];
}
vi.stubGlobal("IntersectionObserver", MockIO);

export const intersectAll = () => {
  for (const o of [...observers]) o.cb([...o.els].map((target) => ({ target, isIntersecting: true, intersectionRatio: 1 })));
};

window.matchMedia ||= ((q: string) => ({
  matches: false,
  media: q,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
Element.prototype.scrollIntoView = vi.fn();

// jsdom não implementa <dialog>.showModal/close
HTMLDialogElement.prototype.showModal ||= function showModal(this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ||= function close(this: HTMLDialogElement) {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};

// por omissão a rede falha (nenhum teste fala com a rede real); cada teste pode substituir
vi.stubGlobal(
  "fetch",
  vi.fn(() => Promise.reject(new TypeError("offline"))),
);

afterEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new TypeError("offline"))),
  );
  cleanup();
  observers.clear();
  vi.useRealTimers();
});
