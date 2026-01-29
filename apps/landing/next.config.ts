import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./app/_shared/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@buildea/ui"],
  cacheComponents: true,
};

export default withNextIntl(nextConfig);
