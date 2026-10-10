# Qualidade, testes e observabilidade

## Comandos
| Comando | O que faz |
|---|---|
| `npm run check` | tudo de uma vez: Biome + tipos + arquitectura + Knip + testes com cobertura |
| `npm run lint` / `lint:fix` | Biome (lint + formatação + imports) |
| `npm run typecheck` | TypeScript (app e testes) |
| `npm run arch` | contrato de arquitectura (dependency-cruiser) |
| `npm run knip` | código, ficheiros e dependências não usados |
| `npm test` / `test:cov` | Vitest (unitários + integração), com cobertura |
| `npm run e2e` | Playwright (desktop e mobile), inclui acessibilidade com axe |
| `npm run mutation` | Stryker (mutation testing da lógica pura) |

Hooks locais (Husky): **pre-commit** corre o Biome nos ficheiros em stage; **commit-msg** valida a mensagem com Commitlint.
Mensagens: `tipo(#issue): descrição` — tipos: feat, fix, improve, docs, style, refactor, perf, test, build, ci, chore, revert.

## Contrato de arquitectura (`.dependency-cruiser.cjs`)
- `src/config` só tem dados (não importa nada do projecto)
- `src/lib` só importa `config`
- `src/observability` é isolado (não conhece componentes, lib nem config)
- Secções (`Hero`, `Faq`, …) **não se importam entre si**; partilham via `ui`, `media`, `Logo`
- Peças partilhadas não dependem de secções; produção não importa testes nem devDependencies; sem ciclos

## Testes
- **Unitários:** `src/lib`, `src/config`, `src/observability`
- **Integração (Testing Library + jsdom):** `src/components/components.test.tsx` — FAQ, pacotes, menu, formulário, testemunhos, ErrorBoundary, carregamento sob demanda, regra "sem vermelho"
- **End-to-end (Playwright):** `e2e/site.spec.ts` — arranque sem erros, skeleton/lazy, link directo, WhatsApp, formulário, menu mobile, teclado, `prefers-reduced-motion`, sem scroll horizontal, **axe WCAG A/AA**, e "observabilidade desligada não faz pedidos a terceiros"
- **Cobertura:** limites no `vite.config.ts` (linhas/statements 90%, branches 80%, funções 70%). O relatório vai para o **Codecov** em cada PR (`codecov.yml`: patch ≥ 80%).
- **Mutation testing:** semanal e manual (`.github/workflows/mutation.yml`); limite mínimo 50%.

## Observabilidade
Quatro fornecedores como **adaptadores opcionais**: Sentry, Datadog RUM, New Relic Browser e OpenTelemetry (OTLP/HTTP). **Todos desligados por omissão** — só ligam se todas as suas variáveis existirem (ver `.env.example`). Cada um é um `import()` dinâmico, arranca em tempo ocioso depois do `load` e nunca é descarregado se estiver desligado.

| Fornecedor | Variáveis (Netlify → Environment variables) |
|---|---|
| Sentry | `VITE_SENTRY_DSN` |
| Datadog | `VITE_DD_APPLICATION_ID`, `VITE_DD_CLIENT_TOKEN`, `VITE_DD_SITE` |
| New Relic | `VITE_NR_LICENSE_KEY`, `VITE_NR_APPLICATION_ID`, `VITE_NR_ACCOUNT_ID`, `VITE_NR_TRUST_KEY`, `VITE_NR_AGENT_ID` |
| OpenTelemetry | `VITE_OTEL_EXPORTER_URL` (collector com CORS) |

Recomendação: **ligar um só como principal** (ex.: Sentry para erros) — ligar vários duplica pedidos e peso na página.
Uso no código: `captureError(erro, contexto)` e `track("evento", { props })` de `src/observability`. O `ErrorBoundary` regista erros de renderização. Já há eventos `cta_whatsapp` e `form_submit` (só o tipo de processo).

**Privacidade (obrigatório):** ao ligar qualquer fornecedor, actualizar a Política de Privacidade (`src/config/legal.ts`: Dados, Cookies, Serviços de terceiros).  nunca enviar nome, telefone, email ou mensagem do formulário. Sem gravação de sessão (replay desligado), sem cookies do New Relic, `sendDefaultPii` não activado. Se activar um fornecedor, rever a política de privacidade/consentimento aplicável aos visitantes (Angola e Portugal).

## Configurar no GitHub (uma vez)
1. **Codecov:** instalar a app Codecov no repositório e criar o segredo `CODECOV_TOKEN` (Settings → Secrets → Actions).
2. **Branch protection em `main`:** exigir PR e os checks `Qualidade`, `Commitlint`, `Testes unitários e de integração + Codecov`, `End-to-end (Playwright)`, `Build` e `PR menciona a Issue`.
