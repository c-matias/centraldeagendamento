import { afterEach, describe, expect, it, vi } from "vitest";
import { enabledProviders, readConfig } from "./config";
import { __registerForTests, __resetForTests, captureError, initObservability, track } from "./index";

afterEach(() => __resetForTests());

describe("readConfig", () => {
  it("tudo desligado por omissão", () => {
    const c = readConfig({});
    expect(enabledProviders(c)).toEqual([]);
    expect(c).toMatchObject({ service: "central-de-agendamento-web", env: "production", version: "dev" });
  });
  it("liga cada fornecedor só com as chaves completas", () => {
    expect(enabledProviders(readConfig({ VITE_SENTRY_DSN: "https://x@o.ingest.sentry.io/1" }))).toEqual(["sentry"]);
    expect(enabledProviders(readConfig({ VITE_DD_APPLICATION_ID: "a" }))).toEqual([]);
    expect(enabledProviders(readConfig({ VITE_DD_APPLICATION_ID: "a", VITE_DD_CLIENT_TOKEN: "t" }))).toEqual(["datadog"]);
    expect(readConfig({ VITE_DD_APPLICATION_ID: "a", VITE_DD_CLIENT_TOKEN: "t" }).datadog?.site).toBe("datadoghq.com");
    const nr = {
      VITE_NR_LICENSE_KEY: "l",
      VITE_NR_APPLICATION_ID: "a",
      VITE_NR_ACCOUNT_ID: "c",
      VITE_NR_TRUST_KEY: "t",
      VITE_NR_AGENT_ID: "g",
    };
    expect(enabledProviders(readConfig(nr))).toEqual(["newrelic"]);
    expect(enabledProviders(readConfig({ ...nr, VITE_NR_AGENT_ID: " " }))).toEqual([]);
    expect(enabledProviders(readConfig({ VITE_OTEL_EXPORTER_URL: "https://otel.exemplo.com/v1/traces" }))).toEqual(["otel"]);
  });
  it("usa ambiente e versão fornecidos", () => {
    expect(readConfig({ VITE_APP_ENV: "preview" }, "abc1234")).toMatchObject({ env: "preview", version: "abc1234" });
  });
});

describe("fachada", () => {
  it("não faz nada nem falha sem fornecedores", () => {
    expect(() => captureError(new Error("x"))).not.toThrow();
    expect(() => track("evento")).not.toThrow();
  });
  it("encaminha erros e eventos para todos os fornecedores", () => {
    const a = { captureError: vi.fn(), track: vi.fn() };
    const b = { captureError: vi.fn(), track: vi.fn() };
    __registerForTests(a);
    __registerForTests(b);
    const err = new Error("boom");
    captureError(err, { onde: "teste" });
    track("cta_whatsapp", { n: 1 });
    for (const p of [a, b]) {
      expect(p.captureError).toHaveBeenCalledWith(err, { onde: "teste" });
      expect(p.track).toHaveBeenCalledWith("cta_whatsapp", { n: 1 });
    }
  });
  it("um fornecedor a falhar não afecta os outros nem a página", () => {
    const bad = {
      captureError: vi.fn(() => {
        throw new Error("falha");
      }),
      track: vi.fn(() => {
        throw new Error("falha");
      }),
    };
    const ok = { captureError: vi.fn(), track: vi.fn() };
    __registerForTests(bad);
    __registerForTests(ok);
    expect(() => captureError("e")).not.toThrow();
    expect(() => track("t")).not.toThrow();
    expect(ok.captureError).toHaveBeenCalled();
    expect(ok.track).toHaveBeenCalled();
  });
  it("initObservability devolve a lista vazia sem chaves", async () => {
    await expect(initObservability({}, "t")).resolves.toEqual([]);
  });
});

vi.mock("./sentry", () => ({ initSentry: vi.fn(() => ({ captureError: vi.fn(), track: vi.fn() })) }));
vi.mock("./datadog", () => ({ initDatadog: vi.fn(() => ({ captureError: vi.fn(), track: vi.fn() })) }));
vi.mock("./newrelic", () => ({
  initNewRelic: vi.fn(() => {
    throw new Error("sem rede");
  }),
}));
vi.mock("./otel", () => ({ initOtel: vi.fn(() => ({ captureError: vi.fn(), track: vi.fn() })) }));

describe("initObservability (fornecedores simulados)", () => {
  it("carrega só os activos e devolve os seus nomes", async () => {
    const env = { VITE_SENTRY_DSN: "https://x@o.ingest.sentry.io/1", VITE_OTEL_EXPORTER_URL: "https://otel.exemplo.com/v1/traces" };
    const { initSentry } = await import("./sentry");
    const { initDatadog } = await import("./datadog");
    await expect(initObservability(env, "v1")).resolves.toEqual(["sentry", "otel"]);
    expect(initSentry).toHaveBeenCalledWith(expect.objectContaining({ version: "v1", sentry: { dsn: env.VITE_SENTRY_DSN } }));
    expect(initDatadog).not.toHaveBeenCalled();
  });
  it("se um fornecedor falhar ao iniciar, avisa e os outros continuam", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const nr = {
      VITE_NR_LICENSE_KEY: "l",
      VITE_NR_APPLICATION_ID: "a",
      VITE_NR_ACCOUNT_ID: "c",
      VITE_NR_TRUST_KEY: "t",
      VITE_NR_AGENT_ID: "g",
    };
    const env = { ...nr, VITE_DD_APPLICATION_ID: "a", VITE_DD_CLIENT_TOKEN: "t" };
    await expect(initObservability(env, "v1")).resolves.toEqual(["datadog", "newrelic"]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("newrelic"), expect.any(Error));
    warn.mockRestore();
  });
});

describe("startObservability", () => {
  it("adia o arranque para depois do carregamento (tempo ocioso)", async () => {
    vi.useFakeTimers();
    const { startObservability } = await import("./index");
    const spy = vi.spyOn(window, "addEventListener");
    Object.defineProperty(document, "readyState", { value: "loading", configurable: true });
    startObservability();
    expect(spy).toHaveBeenCalledWith("load", expect.any(Function), { once: true });
    Object.defineProperty(document, "readyState", { value: "complete", configurable: true });
    expect(() => startObservability()).not.toThrow();
    await vi.advanceTimersByTimeAsync(3000);
    spy.mockRestore();
  });
});
