import { datadogRum } from "@datadog/browser-rum";
import type { ObservabilityConfig } from "./config";
import type { Provider } from "./types";

export function initDatadog(c: ObservabilityConfig & { datadog: NonNullable<ObservabilityConfig["datadog"]> }): Provider {
  datadogRum.init({
    applicationId: c.datadog.applicationId,
    clientToken: c.datadog.clientToken,
    site: c.datadog.site,
    service: c.service,
    env: c.env,
    version: c.version,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 0, // sem gravação de sessão
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: "mask",
  });
  return {
    captureError: (e, ctx) => datadogRum.addError(e, ctx),
    track: (name, props) => datadogRum.addAction(name, props),
  };
}
