# Rascunho de Issues e PR — Modo claro/escuro e X nas redes sociais
(Criar no GitHub e substituir `#A`, `#B` pelos números reais.)

## Issue A
**Título:** `[Nova função] Alternância entre modo claro e modo escuro`
**Etiquetas:** `nova-funcao`, `design`, `mobile`
**O que fazer:** botão sol/lua acessível no cabeçalho (desktop e telemóvel); preferência em `localStorage`; 1.ª visita segue o sistema; sem flash no carregamento; todas as secções, menu móvel, FAQ, formulário, tabela de preços, carrossel, modais e rodapé nos dois modos; paleta azul/branca/cinzenta, **sem vermelho**.
**Critérios:** contraste WCAG AA nos dois modos (axe); foco e hover visíveis; descrição acessível "Activar modo escuro/claro"; `npm run check` e `npm run e2e` passam.
**Pendente (empresa):** confirmar se o modo escuro agrada visualmente; decidir se se menciona o armazenamento da preferência na Política de Privacidade.

## Issue B
**Título:** `[Melhoria] Adicionar o X às redes sociais`
**Etiquetas:** `melhoria`
**O que fazer:** `https://x.com/central_de_` na secção de redes sociais, rodapé, contactos e páginas legais, com ícone do X, `target="_blank"`, `rel="noopener noreferrer"` e descrição acessível "Visitar a Central de Agendamento no X". Não alterar Instagram, Facebook e TikTok.

## PR
**Título:** `[Nova função] #A Modo claro/escuro e X nas redes sociais`
**Branch:** `nova-funcao/A-tema-escuro-x`
```
Closes #A
Closes #B

## O que mudou
- Tokens de cor como variáveis CSS (:root/.dark) + Tailwind darkMode por classe; migração de bg-white/text-brand para bg-surface/bg-page/text-fg-*
- src/lib/theme.ts, ThemeToggle, script no <head> dos 3 HTML (sem flash)
- XIcon + X em SITE.social, Social, Footer, Contact e LegalLayout
- Link directo (#secção) mais robusto quando o layout muda depois do carregamento
- Testes: tema (unidade, integração, paleta/contraste), e2e nos dois modos e viewports; docs e AGENTS.md

## Como testar
Deploy Preview: <link> → botão sol/lua (computador e telemóvel), recarregar, e links do X
```
