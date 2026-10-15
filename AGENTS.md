# AGENTS.md — Central de Agendamento

Instruções para **qualquer agente (humano ou IA, de qualquer modelo)** que trabalhe neste repositório.
Leia este ficheiro antes de alterar código. Em caso de conflito com outras instruções do projecto, este ficheiro prevalece.

## 1. Projecto
Landing page institucional (página única) da **Central de Agendamento**, empresa privada em Angola que presta apoio e orientação em processos de agendamento relacionados com pedidos de visto (Portugal).
- Stack: React 18 + TypeScript + Vite + Tailwind 3 + Framer Motion + Lucide.
- Deploy: Netlify, ligado a este repositório (`netlify.toml`: `npm run build` → `dist`).
- Idioma do site e dos textos: português de Angola. Idioma de Issues, PRs e commits: português.

Comandos: `npm ci` (ou `npm install`), `npm run dev`, `npm run build`, `npm run check`, `npm run e2e` (obrigatórios antes de abrir PR — ver secção 6).

Onde mexer:
- Conteúdo, contactos, redes, pacotes, FAQ, testemunhos: `src/config/site.ts`
- Cores da marca: `tailwind.config.js` (`brand.*`)
- Componentes por secção: `src/components/`
- Imagens: `src/assets/` (fotografias) e `public/images/` (logótipo, favicon)

## 2. Fluxo de trabalho obrigatório: Issue → Branch → PR → Deploy

**Toda a tarefa tem uma Issue. Todo o deploy passa por um PR. Nunca se faz push directo para `main`.**

### 2.1 Tipos de tarefa e etiquetas
| Tipo | Etiqueta | Quando usar |
|---|---|---|
| Correção | `correcao` | algo está errado, partido ou desalinhado |
| Melhoria | `melhoria` | algo existente fica melhor (design, texto, performance, acessibilidade) |
| Nova função | `nova-funcao` | algo que ainda não existe |

Etiquetas opcionais: `conteudo`, `design`, `mobile`, `bloqueado`.

### 2.2 Passos
1. **Criar a Issue antes de começar** (modelos em `.github/ISSUE_TEMPLATE/`). Título: `[Correção|Melhoria|Nova função] descrição curta`. Deve ter contexto, o que fazer e critérios de aceitação.
2. **Criar a branch a partir de `main` actualizada**: `correcao/<nº>-slug`, `melhoria/<nº>-slug` ou `nova-funcao/<nº>-slug` (ex.: `melhoria/14-faq-recolhivel`).
3. **Commits pequenos**, em português, com o número da Issue: `fix(#14): corrige alinhamento do menu`, `feat(#15): adiciona campo Pacote ao formulário`, `improve(#16): comprime imagens`.
4. **Abrir o PR para `main`** usando o modelo `.github/PULL_REQUEST_TEMPLATE.md`:
   - Título: `[Tipo] #<nº> título`.
   - **A descrição tem de mencionar a Issue** com palavra de fecho: `Closes #14` (ou `Fixes #14`). Sem isto o CI falha.
   - Um PR resolve **uma** Issue (ou um grupo pequeno e coerente, cada uma com `Closes #n`).
5. **Verificar o Deploy Preview do Netlify** (aparece no PR) em telemóvel (≈390 px) e em computador. Colar o link na descrição.
6. **CI verde + revisão** → merge (preferir *squash*). O merge em `main` dispara o deploy de produção.
7. A Issue fecha-se sozinha pelo `Closes #n`. Se algo ficar por fazer, abrir **nova Issue** em vez de deixar trabalho solto.

### 2.3 Se o agente não conseguir criar Issues ou PRs
(sem acesso ao GitHub, sem `gh`, sem token)
- **Não saltar o processo em silêncio.** Escrever o texto completo da Issue (título, etiqueta, contexto, critérios) e o texto do PR (com `Closes #?`) e entregá-los ao utilizador para ele os criar.
- Dizer claramente o que **não** foi criado no GitHub.
- Nunca inventar números de Issue ou links de PR.

### 2.4 Com `gh` disponível
```bash
gh issue create --title "[Melhoria] ..." --label melhoria --body "..."
git switch -c melhoria/<nº>-slug
# ... trabalhar, commits ...
gh pr create --base main --title "[Melhoria] #<nº> ..." --body "Closes #<nº>
..."
```

## 3. Regras de conteúdo e marca (nunca violar)
- **Não inventar** informação: preços, números de clientes, anos de experiência, taxas de aprovação, certificações, morada, horários, parcerias.
- **Testemunhos só reais**, com autorização do cliente. Dúvida → perguntar ao dono do projecto.
- **Transparência obrigatória**: a Central de Agendamento é uma empresa privada, **não** é o Consulado de Portugal nem entidade governamental, e **não garante** aprovação de vistos. Manter o aviso no rodapé e o FAQ correspondente. Não usar linguagem ou imagens que sugiram entidade oficial (brasões, bandeiras em destaque, balcões/fardas de consulado).
- Não prometer marcações garantidas nem resultados que dependam das autoridades.
- **Paleta: só azul + branco + cinzas neutros. Proibido vermelho** (botões, ícones, badges, links, alertas, gradientes, hover). Hover = azul mais claro/escuro. Cores: marca `#101070`/`#000A60`, royal `#2350D9`, claro `#7FB0FF`, neutros `#FFFFFF`/`#F5F7FA`.
- Contactos oficiais ficam em `src/config/site.ts` (WhatsApp, email, redes). Não duplicar em componentes.

## 4. Padrões de código e UI
- Mobile-first (390 px primeiro, depois tablet e desktop). Sem scroll horizontal.
- Acessibilidade: contraste adequado, `alt` descritivo (decorativas com `alt=""`), labels nos inputs, foco visível, HTML semântico, `aria-*` quando necessário.
- Componentes pequenos e reutilizáveis (`src/components/ui.tsx`); sem duplicação desnecessária; conteúdo em `src/config/site.ts`.
- Imagens optimizadas (< ~250 KB cada, largura útil ≤ 1600 px); `loading="lazy"` abaixo da dobra.
- Animações discretas; respeitar `prefers-reduced-motion`.
- Imports de imagens exigem `src/vite-env.d.ts` (já existe — não remover).

## 5. Movimento, carregamento e progresso (obrigatório em toda a interface)
Baseado na skill [`kylezantos/design-motion-principles`](https://github.com/kylezantos/design-motion-principles). Ponderação do projecto (landing page): **Jakub** (polimento) + **Jhey** (detalhes) e **Emil** (formulários/menu). Código partilhado em `src/lib/motion.ts` — **usar sempre estes valores**.
- **Entrada:** opacity + `translateY(8px)` + `blur(4px)` → nítido, spring `bounce: 0`, ~450 ms (`revealProps`, `hidden/shown`). Cartões em grupo usam *stagger* de 60 ms.
- **Saída:** mais subtil e rápida (~180 ms, `leave`). Elementos que desaparecem usam `AnimatePresence`.
- **Só animar** `transform`, `opacity`, `filter`. Nunca `width/height/top/left`. Abrir/fechar acordeões com `grid-template-rows` (0fr→1fr).
- **Easing:** `cubic-bezier(0.22,1,0.36,1)` ou spring; nunca `ease` / `ease-in-out` genéricos; nada a começar em `scale(0)`.
- **Skeleton:** toda a secção carregada sob demanda mostra `SectionSkeleton` (`Deferred.tsx`); toda a imagem usa `LazyImage` (`media.tsx`: skeleton + lazy + fade/blur). Há skeleton de arranque em `index.html`.
- **Lazy-loading:** secções abaixo da dobra são `lazy()` dentro de `<Deferred id=… minH=…>` (carregam ~600 px antes de entrar no ecrã). Ao adicionar secção nova: criar o componente, importar com `lazy` e envolver em `Deferred` com `minH` próximo da altura real (evita saltos de layout e mantém o `id` para âncoras).
- **Progresso:** barra de leitura no topo (Navbar), linha de progresso em "Como funciona", barra de tempo no carrossel de testemunhos (pausa com rato/foco), estados *a enviar → concluído* no formulário (com barra de progresso).
- **Frequência:** não animar interacções muito frequentes ou iniciadas por teclado; sem animações em *loop* de atenção (pulsos, brilhos).
- **Acessibilidade:** tudo respeita `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` + regra global em `index.css`). Animação funcional tem alternativa sem movimento.
- Testar sempre: Deploy Preview em ≈390 px, link directo (`/#pacotes`) e modo "reduzir movimento".

## 6. Qualidade, testes e observabilidade (obrigatório)
Detalhes e comandos em [`docs/QUALIDADE-E-OBSERVABILIDADE.md`](docs/QUALIDADE-E-OBSERVABILIDADE.md).
- Antes de abrir PR: `npm run check` e, se mexeu em UI/fluxos, `npm run e2e`. O CI repete tudo e bloqueia o merge se falhar.
- **Biome** é o único formatador/linter (não adicionar ESLint/Prettier). **Commits** seguem Commitlint: `tipo(#issue): descrição`.
- **Arquitectura:** respeitar o contrato (`npm run arch`): secções não se importam entre si; `config` só dados; `lib` só `config`; `observability` isolado. Peças partilhadas em `ui`/`media`/`Logo`.
- **Código morto:** `npm run knip` tem de passar — não deixar exports, ficheiros ou dependências sem uso.
- **Testes:** toda a função/componente novo traz teste (Vitest) e todo o fluxo novo de utilizador traz teste e2e (Playwright). Não baixar os limites de cobertura. Correção → primeiro um teste que falha.
- **Acessibilidade:** o teste axe do e2e tem de passar (WCAG A/AA, sem violações graves).
- **Observabilidade:** usar apenas `captureError`/`track` de `src/observability`; **nunca** enviar dados pessoais (nome, telefone, email, mensagem); fornecedores novos só como adaptadores opcionais e carregados sob demanda; chaves só por variáveis `VITE_*` (documentar no `.env.example`).

## 7. Páginas jurídicas (Política de Privacidade e Termos e Condições)
- Rotas limpas: `/politica-de-privacidade` e `/termos-e-condicoes`. São páginas HTML próprias (multi-page do Vite: `politica-de-privacidade/index.html`, `termos-e-condicoes/index.html`, entrada `src/pages/main.tsx`). O `public/_redirects` serve os URLs sem barra final no Netlify. **Ao criar nova página: novo `index.html` em pasta própria + entrada em `vite.config.ts` + regra em `_redirects`.**
- Conteúdo em `src/config/legal.ts`; layout em `src/pages/LegalLayout.tsx` (mesma navbar, footer e botão de WhatsApp; `basePath="/"` faz as âncoras apontarem para a landing).
- **Datas:** `PRIVACY_UPDATED` e `TERMS_UPDATED` em `legal.ts` (hoje `[DATA A DEFINIR]`). Actualizar sempre que o texto mudar.
- **Placeholders** (`{ t: "placeholder" }`) para pagamentos, cancelamento/reembolso e confirmação de cookies: só a empresa os preenche. **Nunca inventar** métodos de pagamento, políticas, prazos de conservação, leis/artigos, fornecedores ou entidades.
- **Aviso de revisão:** `LEGAL_REVIEW_NOTICE` fica `true` até a empresa (e idealmente um profissional jurídico) validar os textos.
- **Manter a Política de Privacidade verdadeira:** ao activar um fornecedor de observabilidade/analytics, adicionar cookies, mudar o formulário (hoje abre o WhatsApp e não guarda dados) ou integrar um serviço novo, actualizar as secções *Dados*, *Cookies* e *Serviços de terceiros* e a data, no mesmo PR.
- O footer de todas as páginas tem os links legais (`LEGAL_LINKS` em `site.ts`).

## 8. Galeria (carrossel) e Tabela de Preços — imagens locais
Detalhes em [`docs/GALERIA-CARROSSEL.md`](docs/GALERIA-CARROSSEL.md).
- **Origem das imagens:** ficheiros do projecto. Carrossel: `public/images/carousel/` (JPG/JPEG/PNG/WebP); tabela de preços: `public/images/tabela-precos.(jpg|jpeg|png|webp)`. **Sem API, chaves nem variáveis de ambiente.** Não reintroduzir Google Drive nem serviços externos para carregar imagens.
- **Não há lista a manter:** `vite-plugins/site-assets.ts` descobre os ficheiros no build (módulos virtuais `virtual:carousel-images` e `virtual:price-table`). Adicionar imagem = pôr o ficheiro na pasta + deploy. Não inventar nomes de imagens nem pôr imagens fictícias na pasta (as de teste vivem em `e2e/fixtures/`).
- UI: `Gallery.tsx`, `Carousel.tsx`, `Lightbox.tsx`, `PriceTable.tsx`; configuração visual em `src/config/gallery.ts`. A tabela de preços é **sempre a imagem original** (nunca recriada em HTML) e a secção só aparece se o ficheiro existir.
- Preços dos pacotes: `PACKAGES[].price` em `src/config/site.ts`. Alterar só com confirmação do dono do projecto.
- Pedir ao utilizador imagens leves (≤1600 px, <250 KB). Estados testados: com imagens, pasta vazia, imagem em falta (alternativa visível), ampliação, teclado, mobile. Sem vermelho.

## 9. Tema claro/escuro e redes sociais
- **Tema:** botão sol/lua no cabeçalho (`ThemeToggle.tsx`), lógica em `src/lib/theme.ts`. Preferência em `localStorage` (`ca:theme`: `light`|`dark`); na 1.ª visita segue o sistema operativo; um script no `<head>` de cada HTML (`index.html` e páginas legais) aplica a classe `dark` ao `<html>` antes da primeira pintura (sem flash). **Qualquer HTML novo tem de levar esse script.**
- **Cores = variáveis CSS** (`src/index.css`, `:root` e `.dark`) ligadas ao Tailwind (`tailwind.config.js`). **Nunca** usar hex nem `bg-white`/`text-white` para superfícies de conteúdo. Usar os tokens: fundo da página `bg-page`; cartões/menus/campos `bg-surface`; secções alternadas `bg-brand-soft`; texto `text-brand-ink` / `text-brand-muted`; **títulos, links e ícones azuis `text-fg-brand` / `text-fg-royal`**; bordas `border-brand-line`; botões e faixas azuis `bg-brand` / `bg-brand-royal` com `text-white`. Branco fixo (`bg-white`) só em elementos que ficam sobre azul/overlay escuro (botão claro do CTA, botões do visualizador) e então com `text-brand-dark`.
- **Proibido vermelho** em qualquer modo (testes de paleta e e2e falham se aparecer). Os pares de cores têm de manter contraste WCAG AA (`src/theme-palette.test.ts` e axe nos dois modos).
- Componente novo: verificar nos dois modos, em ≈390 px e em desktop, e acrescentá-lo ao teste e2e `theme.spec.ts` se for uma superfície nova.
- **Redes sociais:** ligações em `SITE.social` (`src/config/site.ts`): Instagram, Facebook, TikTok e X (`https://x.com/central_de_`). Adicionar uma rede = acrescentar ali e nos 4 sítios que as listam (secção `Social`, `Footer`, `Contact` e `LegalLayout`). Links externos com `target="_blank"` e `rel="noopener"` (o X usa `noopener noreferrer`). O ícone do X é `XIcon.tsx` (a lucide-react não o tem).
- Privacidade: o `localStorage` guarda só a preferência de tema (sem dados pessoais); se a empresa rever a Política de Privacidade, pode mencioná-lo na secção *Cookies*.

## 10. Checklist antes de pedir merge
- [ ] Existe Issue e o PR tem `Closes #n`
- [ ] `npm run build` e `npm run check` passam (Biome, tipos, arquitectura, Knip, testes + cobertura)
- [ ] e2e (`npm run e2e`) passa quando há mudança de UI/fluxo
- [ ] Testado em ≈390 px e em desktop (Deploy Preview)
- [ ] Verificado nos modos claro e escuro (contraste AA, sem vermelho)
- [ ] Sem vermelho, sem informação inventada, aviso de transparência intacto
- [ ] Nova UI com skeleton, lazy-loading, entrada/saída suaves e `prefers-reduced-motion` (secção 5)
- [ ] Sem ficheiros grandes/desnecessários (`node_modules`, `dist`)
- [ ] Este `AGENTS.md` actualizado se o processo ou as regras mudaram
