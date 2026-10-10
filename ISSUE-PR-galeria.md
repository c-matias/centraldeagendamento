# Rascunho de Issue e PR — Galeria com Google Drive
(Criar no GitHub e substituir `#N` pelo número real.)

## Issue
**Título:** `[Nova função] Galeria (carrossel) com imagens de uma pasta do Google Drive`
**Etiquetas:** `nova-funcao`, `design`, `mobile`

**Contexto:** queremos mostrar fotografias e publicações da Central de Agendamento, geridas numa pasta do Drive (ID `12zbmp1k38-RQZvwSzgCZT-GJDBFF-_pL`), detectando novas imagens sem mexer no código.

**O que fazer**
- Netlify Functions `/api/gallery` (lista JPG/PNG/WebP) e `/api/gallery/image` (miniaturas servidas pelo servidor); chave só nas variáveis do Netlify
- Secção "Galeria da Central de Agendamento": carrossel responsivo (setas, indicadores, deslize, teclado), ampliação, skeleton, lazy-loading, cache, estados vazio/erro, alternativa estática
- Documentação e regras no `AGENTS.md`

**Critérios de aceitação**
- [ ] Nenhuma credencial no código do browser (teste automático)
- [ ] Desktop 3 por vista, tablet 2, telemóvel 1; sem scroll horizontal
- [ ] Estados de carregamento, pasta vazia, erro e imagem partida testados
- [ ] Sem vermelho; axe sem violações graves; `npm run check` e `npm run e2e` passam

**Pendente (empresa/dev):** criar a chave da Drive API e definir `GOOGLE_DRIVE_API_KEY` no Netlify; confirmar que o deploy é por Git (funções); testar com a pasta real; decidir se se menciona o armazenamento local na Política de Privacidade.

## PR
**Título:** `[Nova função] #N Galeria com Google Drive`
**Branch:** `nova-funcao/N-galeria-google-drive`
```
Closes #N

## O que mudou
- netlify/lib/drive.ts + netlify/functions/{gallery,gallery-image}.ts (+ testes)
- src/config/gallery.ts, src/lib/gallery.ts, useGallery, Gallery, Carousel, Lightbox
- LazyImage com srcSet/erro; correcção do posicionamento do LazyImage com className absolute
- Testes de unidade, integração e e2e (estados, teclado, segurança); docs e AGENTS.md

## Como testar
Deploy Preview: <link>/#galeria (requer GOOGLE_DRIVE_API_KEY no Netlify) e /api/gallery
```
