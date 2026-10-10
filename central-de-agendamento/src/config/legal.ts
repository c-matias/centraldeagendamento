/** ===== Conteúdo das páginas jurídicas =====
 * Informação geral, a rever pela empresa (e idealmente por um profissional jurídico) antes da publicação definitiva.
 * Não inventar legislação, números de lei, entidades, prazos, métodos de pagamento ou políticas.
 * Para substituir um placeholder: troque o bloco { t: "placeholder" } por blocos { t: "p" } / { t: "ul" }. O design não muda.
 */

/** Datas editáveis (aparecem no cabeçalho e na secção de actualizações). */
export const PRIVACY_UPDATED = "[DATA A DEFINIR]";
export const TERMS_UPDATED = "[DATA A DEFINIR]";

/** Mostra o aviso de revisão no topo das páginas. Pôr `false` quando o texto estiver validado. */
export const LEGAL_REVIEW_NOTICE = true;
export const LEGAL_REVIEW_TEXT =
  "Informação geral. Este documento está em fase de revisão pela empresa e deve ser validado por um profissional jurídico antes da publicação definitiva.";

export type Block =
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "callout"; title?: string; text: string }
  | { t: "placeholder"; text: string }
  | { t: "updated" }
  | { t: "contact" };

export type Section = { id: string; title: string; blocks: Block[] };

export type LegalDoc = {
  slug: string;
  title: string;
  subtitle: string;
  updated: string;
  contactCta: string;
  sections: Section[];
};

export const PRIVACY: LegalDoc = {
  slug: "politica-de-privacidade",
  title: "Política de Privacidade",
  subtitle: "Como recolhemos, utilizamos e protegemos os seus dados.",
  updated: PRIVACY_UPDATED,
  contactCta: "Falar connosco",
  sections: [
    {
      id: "introducao",
      title: "Introdução",
      blocks: [
        {
          t: "p",
          text: "A Central de Agendamento valoriza a privacidade dos seus clientes e procura proteger os dados pessoais fornecidos através do website, do WhatsApp, de formulários e de outros canais de contacto.",
        },
        { t: "p", text: "Esta Política explica:" },
        {
          t: "ul",
          items: [
            "que dados podem ser recolhidos;",
            "para que são utilizados;",
            "como são protegidos;",
            "quando podem ser partilhados;",
            "quais são os direitos do titular dos dados.",
          ],
        },
      ],
    },
    {
      id: "dados-recolhidos",
      title: "Dados que podem ser recolhidos",
      blocks: [
        { t: "p", text: "Conforme a utilização que faça dos nossos serviços, podem ser recolhidos:" },
        {
          t: "ul",
          items: [
            "nome;",
            "número de telefone;",
            "contacto de WhatsApp;",
            "endereço de email, quando fornecido;",
            "tipo de processo solicitado;",
            "informações fornecidas voluntariamente pelo cliente;",
            "informações necessárias para prestar o serviço contratado;",
            "dados técnicos básicos relacionados com a utilização do website, quando aplicável.",
          ],
        },
        { t: "p", text: "Apenas tratamos os dados que sejam necessários para as finalidades descritas nesta Política." },
        {
          t: "callout",
          title: "Formulário de contacto do website",
          text: "Ao preencher o formulário de contacto, os dados que introduzir são utilizados para abrir uma conversa de WhatsApp com a mensagem já preenchida. O envio efectivo só acontece quando confirmar a mensagem no WhatsApp.",
        },
      ],
    },
    {
      id: "finalidade",
      title: "Finalidade do tratamento",
      blocks: [
        { t: "p", text: "Os dados podem ser utilizados para:" },
        {
          t: "ul",
          items: [
            "responder a pedidos de contacto;",
            "prestar informações sobre os serviços;",
            "prestar os serviços contratados;",
            "comunicar com o cliente;",
            "organizar e acompanhar pedidos;",
            "melhorar o atendimento;",
            "cumprir obrigações legais aplicáveis.",
          ],
        },
        { t: "p", text: "Não utilizamos os dados para finalidades incompatíveis com aquelas que foram informadas ao cliente." },
      ],
    },
    {
      id: "comunicacao",
      title: "Comunicação com o cliente",
      blocks: [
        { t: "p", text: "Os contactos fornecidos podem ser utilizados para comunicação relacionada com:" },
        {
          t: "ul",
          items: [
            "pedidos de informação;",
            "agendamentos;",
            "serviços contratados;",
            "acompanhamento do processo;",
            "esclarecimentos necessários.",
          ],
        },
        {
          t: "p",
          text: "Quando o contacto ocorre através do WhatsApp, a comunicação está também sujeita às políticas e condições do próprio WhatsApp.",
        },
      ],
    },
    {
      id: "partilha",
      title: "Partilha de dados",
      blocks: [
        { t: "p", text: "Os dados pessoais não são vendidos." },
        {
          t: "p",
          text: "Quando necessário para a prestação de determinado serviço ou para o cumprimento de uma obrigação legal, certos dados poderão ser comunicados a entidades ou prestadores relevantes, apenas na medida necessária e legalmente permitida.",
        },
        {
          t: "p",
          text: "A Central de Agendamento é uma empresa privada de prestação de serviços e não é uma entidade governamental.",
        },
      ],
    },
    {
      id: "conservacao",
      title: "Conservação dos dados",
      blocks: [
        {
          t: "p",
          text: "Os dados são conservados apenas durante o período necessário para cumprir as finalidades para as quais foram recolhidos, cumprir obrigações legais ou resolver eventuais questões relacionadas com os serviços.",
        },
      ],
    },
    {
      id: "seguranca",
      title: "Segurança",
      blocks: [
        {
          t: "p",
          text: "Adoptamos medidas razoáveis de segurança para proteger os dados contra acesso, alteração, divulgação ou destruição não autorizados.",
        },
        {
          t: "p",
          text: "Nenhum sistema ou meio de comunicação é totalmente seguro, pelo que não é possível prometer segurança absoluta.",
        },
      ],
    },
    {
      id: "direitos",
      title: "Direitos do titular",
      blocks: [
        {
          t: "p",
          text: "De forma geral e conforme a legislação aplicável, o titular dos dados pode solicitar informações sobre os seus dados e, quando aplicável:",
        },
        {
          t: "ul",
          items: [
            "acesso;",
            "rectificação;",
            "actualização;",
            "eliminação;",
            "limitação do tratamento;",
            "oposição ao tratamento;",
            "outros direitos previstos na legislação aplicável.",
          ],
        },
        {
          t: "callout",
          text: "Para exercer os seus direitos ou esclarecer dúvidas relacionadas com os seus dados pessoais, entre em contacto connosco através dos canais oficiais.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      blocks: [
        { t: "p", text: "O website poderá utilizar cookies ou tecnologias semelhantes, quando aplicável. Tecnicamente, distinguem-se:" },
        {
          t: "ul",
          items: [
            "cookies necessários: indispensáveis ao funcionamento do website;",
            "cookies de preferência: memorizam escolhas do utilizador;",
            "cookies analíticos: ajudam a compreender como o website é utilizado;",
            "cookies de terceiros: colocados por serviços externos integrados no website.",
          ],
        },
        {
          t: "p",
          text: "Apenas são utilizadas as tecnologias efectivamente necessárias ao funcionamento do website e às funcionalidades disponibilizadas.",
        },
        { t: "placeholder", text: "[CONFIRMAR COM A EMPRESA: cookies e ferramentas de análise efectivamente utilizados no website]" },
      ],
    },
    {
      id: "terceiros",
      title: "Serviços de terceiros",
      blocks: [
        {
          t: "p",
          text: "O website pode utilizar serviços externos, como plataformas de comunicação, redes sociais, alojamento ou outros serviços tecnológicos.",
        },
        { t: "p", text: "Esses serviços possuem as suas próprias políticas de privacidade, que recomendamos que consulte." },
      ],
    },
    {
      id: "actualizacoes",
      title: "Actualizações",
      blocks: [{ t: "p", text: "Esta Política de Privacidade poderá ser actualizada periodicamente." }, { t: "updated" }],
    },
    { id: "contacto", title: "Contacto", blocks: [{ t: "contact" }] },
  ],
};

export const TERMS: LegalDoc = {
  slug: "termos-e-condicoes",
  title: "Termos e Condições",
  subtitle: "Condições de utilização do website e dos serviços da Central de Agendamento.",
  updated: TERMS_UPDATED,
  contactCta: "Entrar em contacto",
  sections: [
    {
      id: "disposicoes-gerais",
      title: "Disposições gerais",
      blocks: [
        {
          t: "p",
          text: "Os presentes Termos e Condições regulam a utilização do website e a relação com os serviços disponibilizados pela Central de Agendamento.",
        },
        {
          t: "p",
          text: "Ao utilizar o website ou solicitar serviços, o utilizador declara que leu e compreendeu as condições aplicáveis.",
        },
      ],
    },
    {
      id: "natureza-dos-servicos",
      title: "Natureza dos serviços",
      blocks: [
        {
          t: "callout",
          text: "A Central de Agendamento é uma empresa privada que presta serviços de apoio, orientação e agendamento relacionados com processos de visto.",
        },
        {
          t: "callout",
          text: "A Central de Agendamento não é uma entidade governamental, não representa o Consulado de Portugal e não é responsável pela decisão de concessão ou recusa de vistos.",
        },
      ],
    },
    {
      id: "agendamentos",
      title: "Agendamentos",
      blocks: [
        {
          t: "ul",
          items: [
            "o serviço contratado corresponde ao apoio acordado com o cliente;",
            "a disponibilidade de datas e horários depende das entidades e dos sistemas responsáveis pelo agendamento;",
            "a Central de Agendamento não controla decisões ou disponibilidades externas;",
            "um pedido de serviço não significa garantia de uma determinada data, salvo quando isso for efectivamente confirmado.",
          ],
        },
      ],
    },
    {
      id: "pedidos-de-visto",
      title: "Pedidos de visto",
      blocks: [
        { t: "callout", text: "A Central de Agendamento não garante a aprovação de qualquer pedido de visto." },
        {
          t: "callout",
          text: "A decisão relativa à concessão, recusa ou emissão de um visto pertence exclusivamente às autoridades competentes.",
        },
        {
          t: "p",
          text: "A prestação de um serviço de apoio não substitui os procedimentos oficiais exigidos pelas entidades competentes.",
        },
      ],
    },
    {
      id: "responsabilidade-do-cliente",
      title: "Responsabilidade do cliente",
      blocks: [
        { t: "p", text: "O cliente é responsável por:" },
        {
          t: "ul",
          items: [
            "fornecer informações verdadeiras;",
            "fornecer documentação legítima;",
            "verificar as informações fornecidas;",
            "cumprir os requisitos aplicáveis;",
            "comparecer aos atendimentos;",
            "respeitar os prazos e as instruções das entidades competentes.",
          ],
        },
        {
          t: "p",
          text: "A Central de Agendamento não deve ser responsabilizada por consequências resultantes de informações falsas ou incompletas, ou de documentação irregular fornecida pelo cliente.",
        },
      ],
    },
    {
      id: "servicos-e-precos",
      title: "Serviços e preços",
      blocks: [
        { t: "p", text: "Os serviços e os respectivos preços podem variar." },
        { t: "p", text: "Os valores aplicáveis são comunicados ao cliente antes da contratação, quando aplicável." },
        { t: "p", text: "Quaisquer serviços adicionais serão previamente apresentados ao cliente." },
      ],
    },
    {
      id: "pagamentos",
      title: "Pagamentos",
      blocks: [{ t: "placeholder", text: "[INSERIR MÉTODOS DE PAGAMENTO UTILIZADOS PELA EMPRESA]" }],
    },
    {
      id: "cancelamento-e-reembolsos",
      title: "Cancelamento e reembolsos",
      blocks: [{ t: "placeholder", text: "[INSERIR POLÍTICA DE CANCELAMENTO E REEMBOLSO DA EMPRESA]" }],
    },
    {
      id: "limitacao-de-responsabilidade",
      title: "Limitação de responsabilidade",
      blocks: [
        { t: "p", text: "A Central de Agendamento presta serviços de apoio e não controla:" },
        {
          t: "ul",
          items: [
            "decisões das autoridades;",
            "disponibilidade de agendamentos;",
            "tempos de processamento;",
            "alterações de requisitos;",
            "atrasos provocados por entidades externas;",
            "decisões relativas à concessão ou recusa de vistos.",
          ],
        },
        {
          t: "p",
          text: "Nada nestes Termos exclui ou limita responsabilidades que, nos termos da lei aplicável, não possam ser excluídas ou limitadas.",
        },
      ],
    },
    {
      id: "informacoes-do-website",
      title: "Informações do website",
      blocks: [
        { t: "p", text: "A informação disponível no website tem finalidade informativa e pode ser actualizada." },
        {
          t: "p",
          text: "Os requisitos, procedimentos, taxas, horários e a disponibilidade das entidades competentes podem sofrer alterações. O cliente deve verificar as informações oficiais sempre que necessário.",
        },
      ],
    },
    {
      id: "propriedade-intelectual",
      title: "Propriedade intelectual",
      blocks: [
        { t: "p", text: "Os seguintes elementos:" },
        { t: "ul", items: ["logótipo;", "marca;", "textos;", "imagens próprias;", "elementos gráficos;", "conteúdo do website;"] },
        {
          t: "p",
          text: "pertencem à Central de Agendamento ou são utilizados com autorização ou licença apropriada, conforme aplicável. Não é permitida a reprodução não autorizada do conteúdo.",
        },
      ],
    },
    {
      id: "links-externos",
      title: "Links externos",
      blocks: [
        {
          t: "p",
          text: "O website pode conter links para redes sociais, WhatsApp ou websites externos. A Central de Agendamento não controla necessariamente o conteúdo nem as políticas desses websites.",
        },
      ],
    },
    {
      id: "alteracoes",
      title: "Alterações dos Termos",
      blocks: [{ t: "p", text: "Estes Termos e Condições podem ser actualizados." }, { t: "updated" }],
    },
    { id: "contacto", title: "Contacto", blocks: [{ t: "contact" }] },
  ],
};
