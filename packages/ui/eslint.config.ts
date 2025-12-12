import { defineConfig } from "eslint/config";

import { baseConfig } from "@buildea/eslint-config/base";
import { reactConfig } from "@buildea/eslint-config/react";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
);
