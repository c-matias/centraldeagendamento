/** Contrato de arquitectura (camadas). Corre com: npm run arch */
const SECTIONS = "About|Cta|Contact|Faq|Footer|Gallery|Hero|Navbar|Packages|Services|Social|Steps|Testimonials";
const SHARED = "ui|media|Logo|Deferred|ErrorBoundary|WhatsAppFab|Carousel|Lightbox";

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    { name: "no-circular", severity: "error", comment: "Sem dependências circulares.", from: {}, to: { circular: true } },
    {
      name: "config-is-leaf",
      severity: "error",
      comment: "src/config só contém dados: não depende de mais nada do projecto.",
      from: { path: "^src/config" },
      to: { path: "^src/(components|lib|observability)" },
    },
    {
      name: "lib-only-config",
      severity: "error",
      comment: "src/lib só pode usar config.",
      from: { path: "^src/lib" },
      to: { path: "^src/(components|observability)" },
    },
    {
      name: "observability-isolated",
      severity: "error",
      comment: "Observabilidade não conhece componentes nem conteúdo.",
      from: { path: "^src/observability" },
      to: { path: "^src/(components|lib|config)" },
    },
    {
      name: "shared-ui-is-leaf",
      severity: "error",
      comment: "Peças partilhadas não dependem de secções.",
      from: { path: `^src/components/(${SHARED.replace("|ErrorBoundary", "")})\\.tsx$` },
      to: { path: `^src/components/(${SECTIONS})\\.tsx$` },
    },
    {
      name: "no-section-to-section",
      severity: "error",
      comment: "Secções não se importam entre si; partilham via ui/media/Logo.",
      from: { path: `^src/components/(${SECTIONS})\\.tsx$` },
      to: { path: `^src/components/(${SECTIONS})\\.tsx$`, pathNot: "$1" },
    },
    {
      name: "components-not-from-pages",
      severity: "error",
      comment: "Páginas usam componentes; componentes nunca importam páginas.",
      from: { path: "^src/(components|lib|config|observability)" },
      to: { path: "^src/pages" },
    },
    {
      name: "no-test-in-prod",
      severity: "error",
      comment: "Código de produção não importa testes.",
      from: { path: "^src", pathNot: "\\.test\\.(ts|tsx)$" },
      to: { path: "(\\.test\\.|^tests/|^e2e/)" },
    },
    {
      name: "not-to-dev-dep",
      severity: "error",
      comment: "Produção não usa devDependencies.",
      from: { path: "^src", pathNot: "(\\.test\\.(ts|tsx)|\\.d\\.ts)$" },
      to: { dependencyTypes: ["npm-dev"] },
    },
    {
      name: "no-orphans",
      severity: "warn",
      from: { orphan: true, pathNot: ["\\.d\\.ts$", "^src/(pages/)?main\\.tsx$", "\\.test\\.(ts|tsx)$"] },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    exclude: { path: "\\.test\\.(ts|tsx)$" },
  },
};
