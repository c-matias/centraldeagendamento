# Rascunho de Issues e PR — Observabilidade, Qualidade e Testes
(Criar no GitHub e substituir `#A`, `#B`, `#C` pelos números reais.)

## Issue A
**Título:** `[Nova função] Observabilidade opcional (Sentry, Datadog, New Relic, OpenTelemetry)`
**Etiquetas:** `nova-funcao`
**Contexto:** não há visibilidade de erros nem de desempenho em produção.
**O que fazer:** fachada neutra `captureError`/`track`; adaptadores opcionais carregados sob demanda e desligados por omissão; `ErrorBoundary`; eventos de CTA sem dados pessoais; `.env.example`.
**Critérios:** sem chaves → nenhum pedido a terceiros (teste e2e); com chaves → fornecedor activo; sem PII; documentado.

## Issue B
**Título:** `[Melhoria] Qualidade de código: Biome, Commitlint, Knip, contrato de arquitectura e Stryker`
**Etiquetas:** `melhoria`
**O que fazer:** Biome (lint+formato), Husky + Commitlint, Knip, dependency-cruiser (camadas), Stryker (mutation), scripts `npm run check`.
**Critérios:** `npm run check` passa; hooks locais activos; regras no `AGENTS.md`.

## Issue C
**Título:** `[Nova função] Testes unitários, integração e end-to-end com Codecov e Playwright`
**Etiquetas:** `nova-funcao`
**O que fazer:** Vitest + Testing Library; Playwright (desktop e mobile) com axe; CI com Codecov; limites de cobertura.
**Critérios:** cobertura ≥ limites; e2e passa em CI; relatório no Codecov.

## PR
**Título:** `[Melhoria] #B Observabilidade, qualidade e testes automatizados`
**Branch:** `melhoria/B-qualidade-testes-observabilidade`
```
Closes #A
Closes #B
Closes #C

## O que mudou
- src/observability (Sentry, Datadog, New Relic, OTel opcionais) + ErrorBoundary
- Biome, Commitlint+Husky, Knip, dependency-cruiser, Stryker
- Vitest (unit/integração) + Playwright (e2e + axe) + CI com Codecov
- Logo extraído para Logo.tsx (contrato de arquitectura)
- Correções encontradas pelos testes: link tel:++244…, foco por teclado nas secções lazy

## Como testar
npm run check && npm run e2e
Deploy Preview: <link>
```
Antes do merge: instalar Codecov e criar `CODECOV_TOKEN`; ligar as protecções de branch (ver docs/QUALIDADE-E-OBSERVABILIDADE.md).
