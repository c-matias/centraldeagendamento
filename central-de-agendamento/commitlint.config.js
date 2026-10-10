/** Convenção do AGENTS.md: tipo(#issue): descrição em português. Ex.: fix(#14): corrige alinhamento do menu */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "improve", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"]],
    "scope-case": [0],
    "subject-case": [0],
    "header-max-length": [2, "always", 100],
  },
};
