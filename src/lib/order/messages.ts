/**
 * Message lookup for the order e-mails.
 *
 * The API route builds both e-mails on the server, so it loads the locale's
 * message file directly instead of going through the React-side next-intl
 * context. Missing keys fall back to English, exactly like the site does.
 */
import { defaultLocale, locales, type Locale } from '@/i18n/config';

type MessageTree = Record<string, unknown>;

const cache = new Map<string, MessageTree>();

export async function loadMessages(locale: string): Promise<MessageTree> {
  const target = (locales as readonly string[]).includes(locale) ? (locale as Locale) : defaultLocale;
  const cached = cache.get(target);
  if (cached) return cached;
  const loaded = (await import(`../../../messages/${target}.json`)) as { default: MessageTree };
  cache.set(target, loaded.default);
  return loaded.default;
}

function lookup(tree: MessageTree, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((node, key) => {
    if (node && typeof node === 'object') return (node as MessageTree)[key];
    return undefined;
  }, tree);
  return typeof value === 'string' ? value : undefined;
}

/**
 * Translator over two message trees: the locale's, then English.
 * `{name}` placeholders are replaced from `values`; no ICU here — the order
 * e-mails deliberately use plain strings.
 */
export function makeTranslator(localeMessages: MessageTree, fallback: MessageTree) {
  return (path: string, values?: Record<string, string | number>): string => {
    const template = lookup(localeMessages, path) ?? lookup(fallback, path) ?? path;
    if (!values) return template;
    return template.replace(/\{(\w+)\}/g, (match, key: string) =>
      key in values ? String(values[key]) : match
    );
  };
}

export type Translator = ReturnType<typeof makeTranslator>;
