# Rascunho de Issue e PR — Páginas jurídicas
(Criar no GitHub e substituir `#N` pelo número real.)

## Issue
**Título:** `[Nova função] Páginas Política de Privacidade e Termos e Condições`
**Etiquetas:** `nova-funcao`, `conteudo`

**Contexto:** o site recolhe contactos (WhatsApp/formulário) e presta serviços de apoio a vistos; faltam documentos legais e links no footer.

**O que fazer**
- Páginas `/politica-de-privacidade` (12 secções) e `/termos-e-condicoes` (14 secções), com índice, "← Voltar ao início", contactos e botão de contacto
- Mesma navbar, footer, logótipo, paleta (sem vermelho) e botão de WhatsApp
- Footer em todas as páginas com os dois links legais
- Datas editáveis; placeholders para pagamentos e cancelamento/reembolso; aviso de revisão

**Critérios de aceitação**
- [ ] URLs limpos funcionam em dev, preview e Netlify (`_redirects`)
- [ ] Sem scroll horizontal em 390 px; axe sem violações graves
- [ ] Sem informação inventada (testes de conteúdo)
- [ ] `npm run check` e `npm run e2e` passam

**Pendente (empresa):** data de actualização, métodos de pagamento, política de cancelamento/reembolso, cookies/ferramentas realmente usados, revisão jurídica.

## PR
**Título:** `[Nova função] #N Páginas jurídicas (Privacidade e Termos)`
**Branch:** `nova-funcao/N-paginas-juridicas`
```
Closes #N

## O que mudou
- src/config/legal.ts (conteúdo e datas), src/pages/* (layout e entrada), 2 novos index.html + vite multi-page + public/_redirects
- Footer com links legais; Navbar/Footer/Logo aceitam basePath para âncoras fora da landing
- Testes: conteúdo (nada inventado), integração e e2e (ambos viewports, axe)
- AGENTS.md: regras das páginas jurídicas

## Como testar
Deploy Preview: <link> → /politica-de-privacidade e /termos-e-condicoes (telemóvel e desktop)
```
