import next from "eslint-config-next";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...next,
  {
    plugins: {
      "react-hooks": reactHooks
    },
    rules: {
      "react-hooks/set-state-in-effect": "off"
    }
  }
];

export default eslintConfig;
