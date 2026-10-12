# Galeria (carrossel) e Tabela de Preços — imagens do próprio projecto

Não há API, chaves nem variáveis de ambiente: as imagens são ficheiros do projecto, publicados com o site.

## Carrossel — "Galeria da Central de Agendamento" (`#galeria`)
**Pasta:** `public/images/carousel/`  (no repositório: `central-de-agendamento/public/images/carousel/` se o projecto estiver numa subpasta)

1. Copie as imagens para essa pasta (**JPG, JPEG, PNG ou WebP**).
2. Faça commit/push (ou novo deploy). O Netlify volta a compilar e **a lista é descoberta automaticamente** — **não é preciso editar nenhuma lista**.
3. Remover uma imagem = apagar o ficheiro e fazer deploy.

Regras:
- **Ordem:** ordem natural dos nomes (`1-…`, `2-…`, `10-…`). Para controlar a ordem, nomeie `01-…`, `02-…`, `03-…`.
- **Nomes:** letras, números, `-` e `_` (acentos e espaços funcionam, mas evite-os). O nome serve de texto alternativo ("Promo-Visto-Estudo.png" → "Promo Visto Estudo"); nomes automáticos (`IMG_2043.jpg`, `12.jpg`) usam "Publicação da Central de Agendamento (n)".
- **Peso e tamanho (importante para a velocidade):** largura até **1600 px** e **menos de ~250 KB** por imagem. Use https://squoosh.app para reduzir.
- Subpastas, ficheiros ocultos, GIF, SVG, PDF e outros formatos são ignorados. Máximo de 24 imagens (`GALLERY.maxImages` em `src/config/gallery.ts`).
- **Sem imagens na pasta** → a secção mostra "Ainda não há publicações na galeria" e o botão do Instagram.
- **Formatos:** moldura 4:5. Imagens de proporção parecida preenchem a moldura (`cover`); quadradas, horizontais e verticais altas aparecem **inteiras**, com fundo desfocado. Clique/toque amplia a imagem completa.
- Imagens por vista (3 / 2 / 1), encaixe e proporção: `src/config/gallery.ts`.

## Tabela de Preços (`#precos`)
**Ficheiro:** `public/images/tabela-precos.jpg`  (também aceita `.jpeg`, `.png` ou `.webp` com o mesmo nome base)

- Coloque o ficheiro e faça deploy: a secção **"Tabela de Preços"** aparece sozinha, entre **Serviços** e **Pacotes**.
- Enquanto o ficheiro não existir, a secção **não é mostrada** (não aparece título vazio nem imagem fictícia).
- A imagem é mostrada **completa, sem cortes**, com a proporção original; clique/toque amplia (visualizador acessível: Esc ou botão "Fechar") e há o link "Abrir imagem original".
- A tabela **não** é reproduzida em HTML. Para mudar os preços da tabela, substitua o ficheiro.
- Preços dos **Pacotes** (cartões): `PACKAGES` em `src/config/site.ts` (campo `price`).

## Como funciona (técnico)
`vite-plugins/site-assets.ts` lê as pastas **no momento do build**, ordena os nomes e lê as dimensões reais de cada imagem (evita saltos de layout e decide `cover`/`contain`). Em `npm run dev`, adicionar ou remover ficheiros recarrega a página.
Para os testes e2e existe `ASSET_FIXTURES=e2e/fixtures` (imagens de teste; **nunca** usado no build real).
