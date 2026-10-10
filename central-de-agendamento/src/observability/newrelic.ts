import { BrowserAgent } from "@newrelic/browser-agent/loaders/browser-agent";
import type { ObservabilityConfig } from "./config";
import type { Provider } from "./types";

export function initNewRelic(c: ObservabilityConfig & { newrelic: NonNullable<ObservabilityConfig["newrelic"]> }): Provider {
  const n = c.newrelic;
  const agent = new BrowserAgent({
    init: {
      distributed_tracing: { enabled: true },
      privacy: { cookies_enabled: false },
      session_replay: { enabled: false },
    },
    info: { beacon: "bam.nr-data.net", errorBeacon: "bam.nr-data.net", licenseKey: n.licenseKey, applicationID: n.applicationId, sa: 1 },
    loader_config: {
      accountID: n.accountId,
      trustKey: n.trustKey,
      agentID: n.agentId,
      licenseKey: n.licenseKey,
      applicationID: n.applicationId,
    },
  });
  return {
    captureError: (e, ctx) => agent.noticeError(e instanceof Error ? e : new Error(String(e)), ctx),
    track: (name, props) => agent.addPageAction(name, props),
  };
}
