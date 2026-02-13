import { config as base } from "./base.js";

/** @type {import('prettier').Config} */
export const config = {
  ...base,
  arrowParens: "always",
  printWidth: 100,
  bracketSpacing: true,
  jsxSingleQuote: false,
  jsxBracketSameLine: false,
  importOrder: [
    "^react$",
    "^next",
    "<THIRD_PARTY_MODULES>",
    "^@/components/(.*)$",
    "^@/utils/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
