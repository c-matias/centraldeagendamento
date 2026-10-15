import priceTable from "virtual:price-table";
import { MotionConfig } from "framer-motion";
import { lazy, useEffect } from "react";
import Deferred from "./components/Deferred";
import ErrorBoundary from "./components/ErrorBoundary";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import WhatsAppFab from "./components/WhatsAppFab";

const About = lazy(() => import("./components/About"));
const Services = lazy(() => import("./components/Services"));
const PriceTable = lazy(() => import("./components/PriceTable"));
const Packages = lazy(() => import("./components/Packages"));
const Steps = lazy(() => import("./components/Steps").then((m) => ({ default: m.Steps })));
const TrustBar = lazy(() => import("./components/Steps").then((m) => ({ default: m.TrustBar })));
const Gallery = lazy(() => import("./components/Gallery"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const Social = lazy(() => import("./components/Social"));
const Faq = lazy(() => import("./components/Faq"));
const Cta = lazy(() => import("./components/Cta"));
const Contact = lazy(() => import("./components/Contact"));
const Footer = lazy(() => import("./components/Footer"));

export default function App() {
  // Links directos (#pacotes): as secções são montadas depois, por isso repete o scroll quando o layout assenta.
  useEffect(() => {
    const h = window.location.hash;
    if (!h) return;
    // O layout só assenta quando as imagens e secções acima carregam: repete o scroll, mas pára assim que o utilizador mexer.
    let userMoved = false;
    const stop = () => {
      userMoved = true;
    };
    const events = ["wheel", "touchstart", "keydown", "mousedown"] as const;
    for (const e of events) window.addEventListener(e, stop, { passive: true, once: true });
    const go = () => {
      if (!userMoved) document.querySelector(h)?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    };
    const t = [50, 400, 900, 1800, 3000].map((ms) => setTimeout(go, ms));
    return () => {
      for (const id of t) clearTimeout(id);
      for (const e of events) window.removeEventListener(e, stop);
    };
  }, []);
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <Navbar />
        <main>
          <Hero />
          <Deferred id="sobre" minH="40rem" cards={0}>
            <About />
          </Deferred>
          <Deferred id="servicos" minH="60rem">
            <Services />
          </Deferred>
          {priceTable && (
            <Deferred id="precos" minH="44rem" cards={0}>
              <PriceTable />
            </Deferred>
          )}
          <Deferred id="pacotes" minH="34rem">
            <Packages />
          </Deferred>
          <Deferred id="como" minH="40rem" cards={0}>
            <Steps />
          </Deferred>
          <Deferred minH="10rem" cards={0} header={false}>
            <TrustBar />
          </Deferred>
          <Deferred id="galeria" minH="40rem" cards={3}>
            <Gallery />
          </Deferred>
          <Deferred id="feedbacks" minH="30rem" cards={1}>
            <Testimonials />
          </Deferred>
          <Deferred minH="26rem">
            <Social />
          </Deferred>
          <Deferred id="faq" minH="36rem" cards={0}>
            <Faq />
          </Deferred>
          <Deferred minH="26rem" cards={0}>
            <Cta />
          </Deferred>
          <Deferred id="contactos" minH="50rem" cards={2}>
            <Contact />
          </Deferred>
        </main>
        <Deferred minH="20rem" cards={0} header={false}>
          <Footer />
        </Deferred>
        <WhatsAppFab />
      </MotionConfig>
    </ErrorBoundary>
  );
}
