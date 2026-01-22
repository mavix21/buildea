import { getRequestConfig } from "next-intl/server";

// Shared common messages from @buildea/features
import commonEs from "@buildea/features/shared/i18n/messages/es";

import appEs from "./messages/es.json";

// const sharedMessages = {
//   en: commonEn,
//   es: commonEs,
// };

export default getRequestConfig(async ({ requestLocale: _ }) => {
  // Typically corresponds to the `[locale]` segment
  // const requested = await requestLocale;
  // const locale = hasLocale(routing.locales, requested)
  //   ? requested
  //   : routing.defaultLocale;

  // const appMessages = (await import(`./messages/${locale}.json`)).default;

  // return {
  //   locale,
  //   messages: {
  //     ...sharedMessages[locale],

  //     ...appMessages,
  //   },
  // };
  //
  return {
    locale: "es",
    messages: { ...commonEs, ...appEs },
  };
});
