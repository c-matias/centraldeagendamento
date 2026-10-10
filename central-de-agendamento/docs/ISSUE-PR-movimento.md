# Rascunho de Issue e PR — Movimento e carregamento
(Criar no GitHub e substituir `#N` pelo número real da Issue.)

## Issue
**Título:** `[Melhoria] Skeleton, lazy-loading e animações de entrada/saída/progresso em toda a interface`
**Etiquetas:** `melhoria`, `design`, `mobile`

**Contexto**
A interface carrega tudo de uma vez e as secções aparecem sem transição consistente. Queremos carregamento percebido mais rápido e movimento coerente, seguindo a skill design-motion-principles (Jakub + Jhey; Emil em formulários/menu).

**O que fazer**
- Skeleton para secções e imagens; skeleton de arranque no `index.html`
- Lazy-loading de secções (`lazy` + `Deferred`) e de imagens (`LazyImage`)
- Entrada (opacity + translateY + blur) e saída subtil (menu, FAQ, carrossel)
- Progresso: leitura da página, "Como funciona", carrossel, envio do formulário
- `prefers-reduced-motion` respeitado; documentar regras no `AGENTS.md`

**Critérios de aceitação**
- [ ] `npm run build` passa; secções em chunks separados
- [ ] Sem saltos de layout; links directos (`/#pacotes`) funcionam
- [ ] Sem scroll horizontal em 390 px
- [ ] Modo "reduzir movimento" sem animações nem shimmer
- [ ] Sem vermelho; sem conteúdo inventado

## PR
**Título:** `[Melhoria] #N Skeleton, lazy-loading e animações em toda a interface`
**Branch:** `melhoria/N-movimento-e-carregamento`

```
Closes #N

## O que mudou
- lib/motion.ts, media.tsx (Skeleton/LazyImage), Deferred.tsx (lazy + skeleton)
- Navbar com menu animado (entrada/saída) e barra de progresso de leitura
- Testemunhos com saída/entrada e barra de tempo; FAQ com acordeão suave
- Formulário com estados a enviar/concluído; botão WhatsApp com entrada
- Regras de movimento adicionadas ao AGENTS.md

## Como testar
Deploy Preview: <link>
Telemóvel (~390 px), link directo /#pacotes e "reduzir movimento".
```
