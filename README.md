# Central de Agendamento — Landing page
React + TypeScript + Tailwind + Framer Motion + Lucide.

    npm install
    npm run dev      # desenvolvimento
    npm run build    # produção (dist/)

- Conteúdo, contactos, redes e placeholders: `src/config/site.ts`
- Cores da marca: `tailwind.config.js` (`brand.*`) — trocar pelos HEX oficiais
- Fotografias: marcadas com comentários `SUBSTITUIR` em Hero.tsx e About.tsx
- Antes de publicar: substituir testemunhos, preços, horário e localização; adicionar og:image/og:url em index.html

## Netlify
- Sem npm local: arraste a pasta `dist/` (ver zip "netlify-site") para https://app.netlify.com/drop
- Com Git: ligar o repositório ao Netlify; o `netlify.toml` já define build (`npm run build`) e publicação (`dist`)

## Contribuir
Todo o trabalho segue **Issue → Branch → PR (com `Closes #n`) → Deploy Preview → merge**. Regras completas, para pessoas e agentes de IA: [`AGENTS.md`](AGENTS.md).
Configuração inicial no GitHub (etiquetas e Issues): `./scripts/setup-github.sh` (requer GitHub CLI autenticado).

## Qualidade
`npm run check` (Biome, tipos, arquitectura, Knip, testes), `npm run e2e` (Playwright), `npm run mutation` (Stryker). Observabilidade opcional (Sentry/Datadog/New Relic/OpenTelemetry) via variáveis `VITE_*` — ver [`docs/QUALIDADE-E-OBSERVABILIDADE.md`](docs/QUALIDADE-E-OBSERVABILIDADE.md) e `.env.example`.

## Páginas jurídicas
`/politica-de-privacidade` e `/termos-e-condicoes` (conteúdo em `src/config/legal.ts`; datas e placeholders por preencher pela empresa). Regras na secção 7 do [`AGENTS.md`](AGENTS.md).

## Galeria e Tabela de Preços
Imagens do próprio projecto: carrossel em `public/images/carousel/` e tabela em `public/images/tabela-precos.jpg` (sem API nem chaves). Ver [`docs/GALERIA-CARROSSEL.md`](docs/GALERIA-CARROSSEL.md).

## Tema claro/escuro
Botão sol/lua no cabeçalho; preferência guardada e, na 1.ª visita, a do sistema. Regras de cores/tokens na secção 9 do [`AGENTS.md`](AGENTS.md).
