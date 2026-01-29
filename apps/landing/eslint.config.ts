import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@buildea/eslint-config/base";
import { nextjsConfig } from "@buildea/eslint-config/nextjs";
import { reactConfig } from "@buildea/eslint-config/react";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
