import { defineConfig } from "eslint/config";

import { baseConfig } from "@buildea/eslint-config/base";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
);
