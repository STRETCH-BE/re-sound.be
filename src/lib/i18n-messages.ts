import type { AbstractIntlMessages } from 'next-intl';

/**
 * Narrow a full message catalog to the given top-level namespaces.
 *
 * The full catalog is ~190-210KB per locale. Serializing all of it into
 * every page through NextIntlClientProvider inflated each page's HTML by
 * that amount. Instead, the locale layout provides only the namespaces its
 * own client components use (nav/footer/cookies), and each page wraps its
 * content in a nested provider carrying just the namespaces of the client
 * components in its own tree.
 *
 * When adding a `useTranslations('<ns>')` call to a client component,
 * make sure `<ns>` is listed by every page that renders it — a missing
 * namespace renders raw message keys.
 */
export function pickMessages(
  messages: AbstractIntlMessages,
  namespaces: string[]
): AbstractIntlMessages {
  const out: AbstractIntlMessages = {};
  for (const ns of namespaces) {
    if (messages[ns] !== undefined) {
      out[ns] = messages[ns];
    }
  }
  return out;
}
