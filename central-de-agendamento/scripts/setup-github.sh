#!/usr/bin/env bash
# Cria etiquetas e as Issues iniciais. Requer: gh auth login (GitHub CLI) e estar dentro do repositório.
set -euo pipefail

label() { gh label create "$1" --color "$2" --description "$3" --force; }
label correcao   1D76DB "Algo está errado, partido ou desalinhado"
label melhoria   5319E7 "Melhorar algo que já existe"
label nova-funcao 0E8A16 "Algo que ainda não existe"
label conteudo   BFD4F2 "Textos, preços, testemunhos, dados"
label design     C5DEF5 "Aspecto visual"
label mobile     0052CC "Versão telemóvel"
label bloqueado  CFD3D7 "À espera de informação do cliente"

issue() { gh issue create --title "$1" --label "$2" --body "$3"; }

issue "[Melhoria] Documentar fluxo Issue → PR → Deploy (AGENTS.md, modelos, CI)" "melhoria" \
"Adicionar AGENTS.md/CLAUDE.md, modelos de Issue e PR e workflow de CI.

**Critérios**
- AGENTS.md descreve o fluxo e as regras de marca
- Modelos de Issue (Correção, Melhoria, Nova função) e de PR
- CI corre o build e exige \`Closes #n\` no PR"

issue "[Nova função] Preços dos pacotes" "nova-funcao,conteudo,bloqueado" \
"Substituir o placeholder \"Valor: consulte-nos\" pelos valores reais de cada pacote (Essencial, Seguro, Agendamento, Documentação, Completo).

**Pendente:** valores oficiais fornecidos pela empresa. Não inventar preços."

issue "[Melhoria] Confirmar autorização e autenticidade dos testemunhos" "melhoria,conteudo,bloqueado" \
"Confirmar que todos os testemunhos em \`src/config/site.ts\` são de clientes reais, com autorização para publicação, e remover os que não o forem."

issue "[Melhoria] Domínio personalizado + og:image e og:url" "melhoria,bloqueado" \
"Ligar o domínio no Netlify e acrescentar \`og:image\` e \`og:url\` em \`index.html\` para pré-visualização do link no WhatsApp e redes.

**Pendente:** domínio escolhido."

issue "[Nova função] Campo \"Pacote de interesse\" no formulário de contacto" "nova-funcao" \
"Adicionar select com os 5 pacotes ao formulário e incluir a escolha na mensagem enviada por WhatsApp.

**Critérios**
- Opções vêm de \`PACKAGES\` em \`src/config/site.ts\`
- Mensagem do WhatsApp inclui o pacote
- Funciona em mobile e é acessível (label, foco)"

issue "[Melhoria] Auditoria de acessibilidade e performance (Lighthouse)" "melhoria,mobile" \
"Correr Lighthouse em mobile, corrigir contraste, alt text, foco e tamanhos de imagem. Meta: Acessibilidade ≥ 95, Performance ≥ 85."

echo "Concluído."
