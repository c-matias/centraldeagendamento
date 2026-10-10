export type Env = Partial<Record<string, string | undefined>>;

export type ObservabilityConfig = {
  service: string;
  env: string;
  version: string;
  sentry?: { dsn: string };
  datadog?: { applicationId: string; clientToken: string; site: string };
  newrelic?: { licenseKey: string; applicationId: string; accountId: string; trustKey: string; agentId: string };
  otel?: { url: string };
};

const SERVICE = "central-de-agendamento-web";

/** Lê as variáveis VITE_*. Cada fornecedor só fica activo se TODAS as suas chaves existirem. Por omissão tudo está desligado. */
export function readConfig(env: Env, version = "dev"): ObservabilityConfig {
  const has = (...keys: string[]) => keys.every((k) => Boolean(env[k]?.trim()));
  const v = (k: string) => (env[k] ?? "").trim();
  return {
    service: SERVICE,
    env: v("VITE_APP_ENV") || "production",
    version,
    sentry: has("VITE_SENTRY_DSN") ? { dsn: v("VITE_SENTRY_DSN") } : undefined,
    datadog: has("VITE_DD_APPLICATION_ID", "VITE_DD_CLIENT_TOKEN")
      ? { applicationId: v("VITE_DD_APPLICATION_ID"), clientToken: v("VITE_DD_CLIENT_TOKEN"), site: v("VITE_DD_SITE") || "datadoghq.com" }
      : undefined,
    newrelic: has("VITE_NR_LICENSE_KEY", "VITE_NR_APPLICATION_ID", "VITE_NR_ACCOUNT_ID", "VITE_NR_TRUST_KEY", "VITE_NR_AGENT_ID")
      ? {
          licenseKey: v("VITE_NR_LICENSE_KEY"),
          applicationId: v("VITE_NR_APPLICATION_ID"),
          accountId: v("VITE_NR_ACCOUNT_ID"),
          trustKey: v("VITE_NR_TRUST_KEY"),
          agentId: v("VITE_NR_AGENT_ID"),
        }
      : undefined,
    otel: has("VITE_OTEL_EXPORTER_URL") ? { url: v("VITE_OTEL_EXPORTER_URL") } : undefined,
  };
}

export const enabledProviders = (c: ObservabilityConfig) =>
  (["sentry", "datadog", "newrelic", "otel"] as const).filter((k) => Boolean(c[k]));
