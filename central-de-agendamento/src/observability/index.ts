import { type Env, enabledProviders, readConfig } from "./config";
import type { Props, Provider } from "./types";

const providers: Provider[] = [];

/** Fachada neutra: o resto da app só conhece captureError e track. Sem fornecedores activos, não faz nada. */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  for (const p of providers) {
    try {
      p.captureError(error, context);
    } catch {
      /* a observabilidade nunca pode partir a página */
    }
  }
}

/** Eventos de interface. NUNCA enviar dados pessoais (nome, telefone, mensagem). */
export function track(name: string, props?: Props): void {
  for (const p of providers) {
    try {
      p.track(name, props);
    } catch {
      /* idem */
    }
  }
}

export async function initObservability(env: Env = import.meta.env, version = __APP_VERSION__): Promise<string[]> {
  const c = readConfig(env, version);
  const active = enabledProviders(c);
  // imports dinâmicos: nada é descarregado se o fornecedor estiver desligado
  const loaders = {
    sentry: async () => c.sentry && (await import("./sentry")).initSentry({ ...c, sentry: c.sentry }),
    datadog: async () => c.datadog && (await import("./datadog")).initDatadog({ ...c, datadog: c.datadog }),
    newrelic: async () => c.newrelic && (await import("./newrelic")).initNewRelic({ ...c, newrelic: c.newrelic }),
    otel: async () => c.otel && (await import("./otel")).initOtel({ ...c, otel: c.otel }),
  } as const;
  for (const name of active) {
    try {
      const p = await loaders[name]();
      if (p) providers.push(p);
    } catch (e) {
      console.warn(`[observabilidade] ${name} não iniciou`, e);
    }
  }
  return active;
}

/** Arranca depois do carregamento, em tempo ocioso, para não afectar o LCP. */
export function startObservability(): void {
  const run = () => void initObservability();
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
  const kick = () => (idle ? idle(run) : setTimeout(run, 2000));
  if (document.readyState === "complete") kick();
  else window.addEventListener("load", kick, { once: true });
}

export const __resetForTests = () => {
  providers.length = 0;
};
export const __registerForTests = (p: Provider) => {
  providers.push(p);
};
