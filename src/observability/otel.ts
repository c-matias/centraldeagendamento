import { trace } from "@opentelemetry/api";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { Resource } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import type { ObservabilityConfig } from "./config";
import type { Provider } from "./types";

export function initOtel(c: ObservabilityConfig & { otel: { url: string } }): Provider {
  const provider = new WebTracerProvider({
    resource: new Resource({ "service.name": c.service, "service.version": c.version, "deployment.environment": c.env }),
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter({ url: c.otel.url }))],
  });
  provider.register({ contextManager: new ZoneContextManager() });
  registerInstrumentations({ instrumentations: [new DocumentLoadInstrumentation(), new FetchInstrumentation()] });
  const tracer = trace.getTracer(c.service, c.version);
  return {
    captureError: (e, ctx) => {
      const span = tracer.startSpan("error");
      span.recordException(e instanceof Error ? e : new Error(String(e)));
      if (ctx) span.setAttributes(ctx as Record<string, string | number | boolean>);
      span.end();
    },
    track: (name, props) => {
      const span = tracer.startSpan(`ui.${name}`);
      if (props) span.setAttributes(props as Record<string, string | number | boolean>);
      span.end();
    },
  };
}
