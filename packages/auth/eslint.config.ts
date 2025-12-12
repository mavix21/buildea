import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@buildea/eslint-config/base";

export default defineConfig(
  {
    ignores: ["script/**"],
  },
  baseConfig,
  restrictEnvAccess,
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-properties": "off",
    },
  },
);
