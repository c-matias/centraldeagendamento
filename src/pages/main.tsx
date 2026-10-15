import { MotionConfig } from "framer-motion";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ErrorBoundary from "../components/ErrorBoundary";
import "../index.css";
import { initTheme } from "../lib/theme";
import { startObservability } from "../observability";
import PrivacyPage from "./PrivacyPage";
import TermsPage from "./TermsPage";

initTheme();
startObservability();

const root = document.getElementById("root");
if (!root) throw new Error("Elemento #root não encontrado");
const Page = document.body.dataset.page === "termos" ? TermsPage : PrivacyPage;
createRoot(root).render(
  <StrictMode>
    <ErrorBoundary label="legal">
      <MotionConfig reducedMotion="user">
        <Page />
      </MotionConfig>
    </ErrorBoundary>
  </StrictMode>,
);
