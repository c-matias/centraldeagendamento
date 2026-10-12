# Rascunho de Issues e PR — Carrossel local, preços dos pacotes e Tabela de Preços
(Criar no GitHub e substituir `#A`, `#B`, `#C` pelos números reais.)

## Issue A
**Título:** `[Correção] Carrossel: carregar imagens de public/images/carousel/ em vez do Google Drive`
**Etiquetas:** `correcao`
**Contexto:** a integração com o Drive dava erros; queremos mudar só a origem das imagens, sem API nem chaves.
**Critérios:** sem dependências do Drive; lista descoberta no build; design/animações/navegação intactos; funciona em local e no Netlify; `npm run check` e `npm run e2e` passam.

## Issue B
**Título:** `[Melhoria] Preços reais dos pacotes`
**Etiquetas:** `melhoria`, `conteudo`
**Valores:** Essencial 25.000 Kz · Seguro 50.000 Kz · Agendamento 130.000 Kz · Documentação 350.000 Kz · Completo 400.000 Kz.
**Critérios:** cada cartão mostra o seu preço; sem "consulte-nos".

## Issue C
**Título:** `[Nova função] Secção "Tabela de Preços" (imagem) junto aos serviços`
**Etiquetas:** `nova-funcao`, `design`, `mobile`
**Critérios:** usa `public/images/tabela-precos.jpg`; imagem completa e responsiva; ampliação acessível; sem tabela em HTML; sem vermelho; secção oculta enquanto o ficheiro não existir.
**Pendente (empresa):** fornecer `tabela-precos.jpg` e as imagens do carrossel.

## PR
**Título:** `[Correção] #A Carrossel local + preços reais + Tabela de Preços`
**Branch:** `correcao/A-carrossel-local-precos`
```
Closes #A
Closes #B
Closes #C

## O que mudou
- vite-plugins/site-assets.ts (descoberta das imagens no build), Gallery usa public/images/carousel/
- Removidas as Netlify Functions e a documentação do Google Drive (só a do carrossel)
- PACKAGES[].price com os valores reais; Packages mostra o preço
- PriceTable (imagem + visualizador ampliado) entre Serviços e Pacotes
- Testes de unidade, integração e e2e; docs e AGENTS.md

## Como testar
Deploy Preview: <link> (#galeria, #precos, #pacotes)
```
