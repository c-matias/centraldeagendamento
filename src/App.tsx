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
    const go = () => document.querySelector(h)?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    const t = [setTimeout(go, 50), setTimeout(go, 800)];
    return () => t.forEach(clearTimeout);
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
