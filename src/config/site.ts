import { CalendarCheck, CheckCircle2, FileText, MapPinned, MessageCircle, PenLine, ShieldCheck, Users } from "lucide-react";

/** ===== Único ficheiro a editar para conteúdo e contactos ===== */
export const SITE = {
  name: "Central de Agendamento",
  phone: "+244936037529",
  phoneLabel: "+244 936 037 529",
  email: "centraldeagendamentopt@outlook.com",
  whatsappMessage: "Olá, Central de Agendamento. Gostaria de obter informações sobre os serviços disponíveis.",
  social: {
    instagram: { url: "https://www.instagram.com/central_de_agendamento", handle: "@central_de_agendamento" },
    facebook: { url: "https://www.facebook.com/share/1FBJznR2wA/", handle: "Central de Agendamento" },
    tiktok: { url: "https://www.tiktok.com/@centraldeagendamento", handle: "@centraldeagendamento" },
    x: { url: "https://x.com/central_de_", handle: "@central_de_" },
  },
  hours: "Seg à Dom: 09:00 - 20:00 ",
  location: "Luanda, Angola - (Remoto)",
  showProcessTypes: true, // false remove a secção "Tipos de processo"
};

/** Descrição acessível do link do X (usada na secção, rodapé e contactos). */
export const X_LABEL = "Visitar a Central de Agendamento no X";

export const LEGAL_LINKS = [
  ["Política de Privacidade", "/politica-de-privacidade"],
  ["Termos e Condições", "/termos-e-condicoes"],
] as const;

export const NAV = [
  ["Início", "#inicio"],
  ["Sobre nós", "#sobre"],
  ["Serviços", "#servicos"],
  ["Pacotes", "#pacotes"],
  ["Como funciona", "#como"],
  ["Feedbacks", "#feedbacks"],
  ["FAQ", "#faq"],
  ["Contactos", "#contactos"],
] as const;

export const ABOUT_POINTS = [
  {
    icon: Users,
    title: "Atendimento personalizado",
    text: "Cada cliente recebe orientação de acordo com as necessidades do seu processo.",
  },
  { icon: FileText, title: "Informação clara", text: "Explicamos as etapas e os procedimentos de forma simples." },
  { icon: CheckCircle2, title: "Acompanhamento", text: "Prestamos apoio ao longo das etapas contratadas." },
];

export const SERVICES = [
  {
    icon: CalendarCheck,
    title: "Agendamento",
    text: "Apoio no processo de agendamento para atendimento relacionado com pedidos de visto.",
  },
  {
    icon: FileText,
    title: "Orientação documental",
    text: "Orientação sobre os documentos e informações que devem ser considerados na preparação do processo.",
  },
  {
    icon: PenLine,
    title: "Apoio no preenchimento",
    text: "Assistência na organização e preenchimento das informações necessárias, quando aplicável.",
  },
  {
    icon: MapPinned,
    title: "Preparação para o atendimento",
    text: "Orientação para que o cliente esteja preparado para a sua ida ao centro de atendimento.",
  },
  { icon: Users, title: "Acompanhamento", text: "Acompanhamento das etapas contratadas e esclarecimento de dúvidas durante o processo." },
];

export const PROCESS_TYPES = ["Visto de Turismo", "Visto de Estudo", "Visto de Trabalho", "Outros processos"];

export const STEPS = [
  ["Entre em contacto", "Fale connosco através do WhatsApp ou dos nossos canais oficiais."],
  ["Explique o seu processo", "Partilhe connosco o tipo de processo que pretende realizar."],
  ["Receba orientação", "A nossa equipa explica as etapas e os procedimentos aplicáveis ao serviço contratado."],
  ["Realize o agendamento", "Procedemos ao apoio correspondente ao serviço contratado."],
  ["Prepare-se para o atendimento", "Receba orientação para chegar preparado para a etapa seguinte do processo."],
] as const;

export const TRUST = [
  { icon: Users, label: "Atendimento personalizado" },
  { icon: CheckCircle2, label: "Processo organizado" },
  { icon: MessageCircle, label: "Comunicação clara" },
  { icon: ShieldCheck, label: "Suporte ao cliente" },
];

/** DEMONSTRAÇÃO — substituir por avaliações reais */
export const TESTIMONIALS = [
  {
    name: "Leovigildo Santos",
    stars: 5,
    text: "Hei-de voltar a solicitar os vossos serviços. Excelente atendimento e acompanhamento durante todo o processo.",
  },
  { name: "Charlene Dias", stars: 5, text: "Explicaram cada etapa de forma clara e simples." },
  { name: "Jair Kangombe", stars: 5, text: "Comunicação rápida e organizada. Recomendo." },
  { name: "Francisco Samuel", stars: 5, text: "O meu visto e o da minha esposa já saíram. Recomendo Bastante." },
  {
    name: "Marlene Joaquim",
    stars: 5,
    text: "Tive algumas dúvidas com os documentos e ajudaram-me a perceber exactamente o que precisava entregar. O processo ficou muito mais simples.",
  },
  {
    name: "Edson Figueiredo",
    stars: 5,
    text: "Gostei principalmente do acompanhamento. Sempre que tinha alguma dúvida, recebia uma resposta e sabia em que ponto estava o meu processo.",
  },
  {
    name: "Sandra Fragoso",
    stars: 5,
    text: "Fizeram a marcação e orientaram-me em relação aos documentos. Não precisei ficar perdida a tentar perceber cada etapa sozinha.",
  },
  {
    name: "Nelson Nzunzi",
    stars: 5,
    text: "O atendimento foi muito rápido e explicaram-me o que precisava fazer antes da marcação. Foi uma experiência tranquila.",
  },
  {
    name: "Ana Dias Salvador",
    stars: 5,
    text: "Tive receio de cometer algum erro com a documentação, mas foram explicando tudo passo a passo. Agradeço muito pelo acompanhamento.",
  },
  {
    name: "Mateus Sebastião",
    stars: 5,
    text: "Desde o primeiro contacto até à marcação, mantiveram uma comunicação clara. Quando precisei de esclarecimentos, responderam rapidamente.",
  },
  {
    name: "Célia Rosa",
    stars: 5,
    text: "O que mais gostei foi a organização. Recebi as informações necessárias e consegui preparar os meus documentos sem tanta complicação.",
  },
  {
    name: "Paulo André",
    stars: 5,
    text: "Já tinha tentado tratar da marcação sozinho e estava com dificuldades. Com a ajuda da Central de Agendamento consegui perceber melhor o processo.",
  },
  {
    name: "Rosa Maria",
    stars: 5,
    text: "Foram muito pacientes a esclarecer as minhas dúvidas e acompanharam o processo até ao fim. Obrigada pelo atendimento.",
  },
  {
    name: "Adriano José",
    stars: 5,
    text: "Atendimento directo e sem complicações. Enviaram-me as orientações necessárias e mantiveram-me informado durante o processo.",
  },
  {
    name: "Cláudia Manuel",
    stars: 5,
    text: "Gostei da forma como organizaram as informações. Sempre que surgia alguma dúvida, podia entrar em contacto e obter esclarecimento.",
  },
  {
    name: "Domingos Kangiva",
    stars: 5,
    text: "O processo correu bem do início ao fim. A equipa explicou o que devia preparar e ajudou-me com a marcação.",
  },
];

export const FAQ = [
  [
    "A Central de Agendamento tem vínculo com o Consulado de Portugal?",
    "Não. A Central de Agendamento é uma empresa privada que presta serviços de apoio e orientação relacionados com processos de agendamento. Não representa o Consulado de Portugal nem qualquer autoridade governamental.",
  ],
  [
    "A Central de Agendamento garante a aprovação do visto?",
    "Não. A decisão sobre a concessão ou recusa de um visto pertence exclusivamente às autoridades competentes. O nosso serviço limita-se ao apoio e orientação durante o processo contratado.",
  ],
  [
    "Como posso solicitar um atendimento?",
    "Pode entrar em contacto connosco através do WhatsApp ou dos nossos canais oficiais. A nossa equipa irá explicar os próximos passos de acordo com o serviço que pretende solicitar.",
  ],
  [
    "Que documentos preciso?",
    "Os documentos necessários dependem do tipo de processo e da finalidade da viagem. Após identificar o serviço pretendido, a nossa equipa poderá orientar relativamente aos documentos e informações necessários.",
  ],
  [
    "Quanto custa o serviço?",
    "O valor depende do serviço solicitado. Contacte-nos através do WhatsApp para conhecer os serviços disponíveis e os respectivos valores.",
  ],
  [
    "Quanto tempo demora o processo?",
    "O prazo pode variar de acordo com o tipo de processo, disponibilidade de agendamento e procedimentos das entidades competentes. Por isso, não é possível garantir um prazo único para todos os casos.",
  ],
  [
    "A Central de Agendamento faz o agendamento por mim?",
    "Sim. Quando o serviço contratado incluir essa modalidade, a nossa equipa presta apoio no processo de agendamento, de acordo com a disponibilidade existente nos canais oficiais.",
  ],
  [
    "Posso contratar apenas o serviço de agendamento?",
    "Sim. Os serviços podem variar de acordo com a necessidade do cliente. Entre em contacto connosco para saber quais as opções disponíveis.",
  ],
  [
    "Vocês também ajudam na preparação dos documentos?",
    "Dependendo do serviço contratado, podemos prestar orientação sobre a documentação necessária e ajudar o cliente a compreender os requisitos aplicáveis ao seu processo.",
  ],
  [
    "Vocês conseguem marcar uma data específica?",
    "A marcação depende da disponibilidade apresentada pelo sistema ou entidade competente no momento do agendamento. Por esse motivo, não podemos garantir uma data específica antes de verificar a disponibilidade.",
  ],
  [
    "Depois do agendamento, ainda preciso de comparecer pessoalmente?",
    "Quando o procedimento da entidade competente exigir a presença do requerente, sim. O cliente deverá comparecer na data e local indicados no agendamento.",
  ],
  [
    "A Central de Agendamento trata directamente do meu visto?",
    "Não. A Central de Agendamento presta serviços de apoio e orientação. A análise do pedido e a decisão final sobre o visto são da responsabilidade exclusiva das autoridades competentes.",
  ],
  [
    "Posso entrar em contacto para esclarecer dúvidas antes de contratar?",
    "Sim. Pode falar connosco através do WhatsApp para esclarecer dúvidas sobre os serviços disponíveis e perceber qual a opção mais adequada ao seu caso.",
  ],
  [
    "Como posso acompanhar o meu processo?",
    "Após a contratação do serviço, a nossa equipa fornecerá as informações relevantes sobre o acompanhamento, de acordo com o serviço solicitado.",
  ],
  [
    "Quais são os meios de pagamento disponíveis?",
    "Os meios de pagamento podem variar de acordo com o serviço contratado. Entre em contacto connosco através do WhatsApp para obter as informações actualizadas.",
  ],
  [
    "Posso cancelar ou alterar um serviço depois de o contratar?",
    "As possibilidades de alteração ou cancelamento dependem do serviço contratado e do estado do processo. Contacte a nossa equipa o mais brevemente possível para verificarmos o seu caso.",
  ],
] as const;

export const FORM_TYPES = ["Visto de Turismo", "Visto de Estudo", "Visto de Trabalho", "Outro"];

export const PACKAGES = [
  { name: "Pacote Essencial", price: "25.000 Kz", highlight: false, items: ["Print/reserva de voo", "Reserva de hotel"] },
  { name: "Pacote Seguro", price: "50.000 Kz", highlight: false, items: ["Print/reserva de voo", "Reserva de hotel", "Seguro de viagem"] },
  { name: "Pacote Agendamento", price: "130.000 Kz", highlight: false, items: ["Agendamento", "Print/reserva de voo", "Reserva de hotel"] },
  {
    name: "Pacote Documentação",
    price: "350.000 Kz",
    highlight: false,
    items: [
      "Agendamento",
      "Print/reserva de voo",
      "Reserva de hotel",
      "Preenchimento de formulário",
      "Organização dos documentos de viagem",
    ],
  },
  {
    name: "Pacote Completo",
    price: "400.000 Kz",
    highlight: true,
    items: [
      "Agendamento",
      "Print/reserva de voo",
      "Reserva de hotel",
      "Seguro de viagem",
      "Preenchimento de formulário",
      "Organização dos documentos de viagem",
    ],
  },
];
