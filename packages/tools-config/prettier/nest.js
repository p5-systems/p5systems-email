import { config as base } from "./base.js";

/** @type {import('prettier').Config} */
export const config = {
  ...base,
  proseWrap: "always",
};
