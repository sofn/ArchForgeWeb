import next from "eslint-config-next";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  // Generated SDK files (schema.d.ts, enums.generated.ts) are build artifacts
  // kept in-tree for typechecking — they are never lint targets.
  { ignores: ["src/types/**"] },
  ...next,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      // Previously disabled repo-wide to silence AuthProvider violations.
      // Those are fixed with derived state (no setState in effects) — the
      // rule stays enforced so regressions fail CI.
      "react-hooks/set-state-in-effect": "error",
      // console.log debug leftovers must not land; warn/error remain allowed
      // for genuine runtime diagnostics.
      "no-console": ["error", { allow: ["warn", "error"] }],
      // Locale-aware navigation: next/link and next/navigation's router
      // helpers drop the /en|/zh prefix and break i18n routing.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/link",
              message: "Import Link from `@/i18n/navigation` so every route keeps its locale prefix.",
            },
            {
              name: "next/navigation",
              importNames: ["Link", "useRouter", "usePathname", "redirect"],
              message:
                "Import from `@/i18n/navigation` so navigation stays locale-aware.",
            },
          ],
        },
      ],
    },
  },
  {
    // Root-level pages render outside the [locale] segment (no locale to
    // preserve), so locale-aware navigation does not apply to them.
    files: ["src/app/not-found.tsx", "src/app/global-error.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
