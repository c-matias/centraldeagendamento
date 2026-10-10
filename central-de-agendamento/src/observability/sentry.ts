import * as Sentry from "@sentry/react";
import type { ObservabilityConfig } from "./config";
import type { Provider } from "./types";

export function initSentry(c: ObservabilityConfig & { sentry: { dsn: string } }): Provider {
  Sentry.init({
    dsn: c.sentry.dsn,
    environment: c.env,
    release: c.version,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    // sem dados pessoais: não enviamos PII por omissão e o formulário nunca é registado
  });
  return {
    captureError: (e, ctx) => Sentry.captureException(e, { extra: ctx }),
    track: (name, props) => Sentry.addBreadcrumb({ category: "ui", message: name, data: props }),
  };
}
