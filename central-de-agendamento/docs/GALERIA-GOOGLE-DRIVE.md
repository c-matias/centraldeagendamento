# Galeria (carrossel) com Google Drive

Secção **"Galeria da Central de Agendamento"** (`#galeria`). As imagens vêm da pasta do Drive
`https://drive.google.com/drive/folders/12zbmp1k38-RQZvwSzgCZT-GJDBFF-_pL` (ID: `12zbmp1k38-RQZvwSzgCZT-GJDBFF-_pL`, pasta "Site - Carrossel").

## Como funciona
```
Browser ──► /api/gallery            (Netlify Function: lista a pasta com a Drive API v3)
        └─► /api/gallery/image?id=…  (Netlify Function: devolve a imagem redimensionada)
```
- **Dinâmico:** novas imagens na pasta aparecem sozinhas (sem alterar código). Atraso máximo ≈ 5–10 min (cache do CDN 5 min + cache do browser 10 min); quem tem a página aberta é actualizado a cada 5 min.
- **Só JPG, JPEG, PNG e WebP.** Subpastas, documentos, GIF, PDF e outros são ignorados.
- **Ordem consistente:** ordem natural dos nomes (`1-…`, `2-…`, `10-…`). Para controlar a ordem, nomeie os ficheiros `01-…`, `02-…`. Alternativa: `GALLERY_ORDER=newest`.
- **A chave nunca vai para o browser.** O browser só fala com `/api/gallery*`; as imagens passam pela função, que só serve ficheiros que estão **dentro** da pasta configurada. Não se usam links de partilha nem URLs temporários de miniaturas: a função pede ao Google a miniatura no momento e devolve os bytes, com cache imutável por versão do ficheiro.
- **Tamanhos:** 640/960/1280 px via `srcset` (e 1920 px só na ampliação). Os originais em alta resolução só são usados se o Google não tiver miniatura.
- **Carregamento:** esqueleto enquanto carrega; imagens com `loading="lazy"`; molduras com proporção fixa (sem saltos de layout); imagem indisponível mostra uma alternativa; cache local (`localStorage`, chave `ca:gallery:v1`) mostra logo a última galeria e mantém-na se a rede falhar.
- **Formatos:** moldura 4:5. Imagens com proporção parecida usam `cover`; quadradas, horizontais e verticais altas aparecem **inteiras** (com fundo desfocado da própria imagem). Clique/toque para ampliar a imagem completa (o texto das publicações nunca fica cortado).
- **Se a API falhar:** mensagem discreta + "Tentar novamente" + botão do Instagram; se existirem imagens locais configuradas (alternativa estática), são usadas.

## 1. Google Cloud (necessário, uma vez)
1. https://console.cloud.google.com → criar (ou escolher) um projecto.
2. **APIs e serviços → Biblioteca → "Google Drive API" → Activar.**
3. **APIs e serviços → Credenciais → Criar credenciais → Chave de API.**
4. **Restringir a chave** (editar a chave):
   - *Restrições de API* → **Restringir chave** → só **Google Drive API**.
   - *Restrições de aplicação*: como a chamada vem do servidor do Netlify (sem IP nem domínio fixos), não há restrição de referrer/IP aplicável. Por isso: **mantenha a chave secreta** (só nas variáveis do Netlify) e defina **quotas diárias** da Drive API (Quotas) para limitar abusos.
5. Não é preciso OAuth, conta de serviço nem facturação para este uso.
6. A pasta tem de estar partilhada como **"Qualquer pessoa com o link → Leitor"** (o link `usp=sharing` indica que está). Se passar a privada, a listagem devolve erro e a galeria mostra a mensagem discreta.

## 2. Netlify (variáveis de ambiente)
*Site configuration → Environment variables → Add a variable* (scope **Functions**; sem prefixo `VITE_`):

| Variável | Valor |
|---|---|
| `GOOGLE_DRIVE_API_KEY` | a chave criada acima |
| `GOOGLE_DRIVE_FOLDER_ID` | `12zbmp1k38-RQZvwSzgCZT-GJDBFF-_pL` (já é o valor por omissão se faltar) |
| `GALLERY_MAX_IMAGES` | opcional, 1–100 (por omissão 24) |
| `GALLERY_ORDER` | opcional: `name` (por omissão) ou `newest` |

Depois: **Deploys → Trigger deploy → Clear cache and deploy site** (as funções só lêem as variáveis num novo deploy).

> **Importante:** as Netlify Functions **só funcionam com deploy por Git (ou CLI)**. O *Netlify Drop* (arrastar a pasta `site`) **não publica funções**: nesse caso a galeria mostra a mensagem discreta (ou as imagens estáticas, se configuradas).

## 3. Verificar
1. Abrir `https://O-SEU-SITE/api/gallery` → deve mostrar `{"images":[…]}`.
   - `{"error":"not_configured"}` (503): falta `GOOGLE_DRIVE_API_KEY` (ou falta redeploy).
   - `{"error":"drive_error"}` (502): chave inválida ou restrita à API errada, Drive API desactivada, pasta não pública ou quota esgotada. Ver *Functions → gallery → Logs* (só mostram o código, nunca a chave).
   - `{"images":[]}`: pasta sem imagens JPG/PNG/WebP.
2. Abrir `https://O-SEU-SITE/#galeria`.
3. Testar localmente: `npx netlify dev` (lê o `.env`; copiar `.env.example` → `.env`). Com `npm run dev` simples as funções não existem e a galeria mostra o estado de erro discreto (comportamento esperado).

## Mudar a pasta, o limite ou o aspecto
- Outra pasta: mudar `GOOGLE_DRIVE_FOLDER_ID` no Netlify (partilhada "qualquer pessoa com o link").
- Imagens simultâneas, encaixe (`auto`/`cover`/`contain`), proporção da moldura, TTL da cache, intervalo de actualização: `src/config/gallery.ts`.

## Alternativa estática (sem Google Cloud)
1. Copiar as imagens (JPG/PNG/WebP, ≤ 1600 px, < 250 KB cada) para `public/images/carousel/`.
2. Listá-las em `GALLERY.fallback` (`src/config/gallery.ts`): `{ src: "/images/carousel/01.jpg", alt: "Descrição", width: 1080, height: 1350 }`.
3. Aparecem sempre que a API não estiver disponível. Para usar **só** estáticas, deixe a API sem configurar.

## Privacidade
- Os visitantes não contactam o Google: as imagens passam pelo servidor do site.
- A galeria guarda no browser (localStorage `ca:gallery:v1`) só a lista de imagens (sem dados pessoais) para carregar mais depressa.
- Ao rever a Política de Privacidade (secção *Cookies*), a empresa pode mencionar este armazenamento técnico.
