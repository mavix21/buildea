/**
 * Shared i18n
 *
 * Internationalization utilities and types.
 * Actual translations and locale setup should be configured per-app.
 */

/**
 * Supported locales type.
 * Extend this in your app as needed.
 */
export type Locale = "en" | "es" | "pt";

/**
 * Default locale for the application.
 */
export const defaultLocale: Locale = "en";

/**
 * List of all supported locales.
 */
export const locales: Locale[] = ["en", "es", "pt"];

/**
 * Check if a string is a valid locale.
 */
export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

/**
 * Get locale from a pathname (assumes /[locale]/... pattern).
 */
export function getLocaleFromPathname(pathname: string): Locale | null {
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  if (maybeLocale && isValidLocale(maybeLocale)) {
    return maybeLocale;
  }

  return null;
}
