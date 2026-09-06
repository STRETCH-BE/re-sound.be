import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * FAQ entries from the content workbook (content/faq/<locale>.json, edited
 * and translated from content/faq/source.json). `showOn` lists where an
 * entry appears: "faq" (the FAQ page), a hub id (rpet | rwood | booths), a
 * product slug, "guide" (booth price guide), "about", "sustainability".
 */
export type FaqCategory = 'rPET' | 'rWood' | 'Booths' | 'General' | 'Ordering';

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  showOn: string[];
  schema: boolean;
}

export const FAQ_CATEGORIES: FaqCategory[] = ['Booths', 'rPET', 'rWood', 'General', 'Ordering'];

const FAQ_DIR = join(process.cwd(), 'content', 'faq');
const cache = new Map<string, FaqItem[]>();

/**
 * All entries for a locale. No English fallback: a locale without its own
 * file shows no workbook rows rather than English ones (every locale must
 * read in its own language).
 */
export function getFaq(locale: string): FaqItem[] {
  if (!cache.has(locale)) {
    const file = join(FAQ_DIR, `${locale}.json`);
    cache.set(locale, existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as FaqItem[]) : []);
  }
  return cache.get(locale)!;
}

/** Entries shown on a given target (hub id, product slug, "guide", …). */
export function faqFor(locale: string, target: string): FaqItem[] {
  return getFaq(locale).filter((f) => f.showOn.includes(target));
}

/** Entries grouped by category, in FAQ_CATEGORIES order (empty groups dropped). */
export function faqByCategory(locale: string): Array<{ category: FaqCategory; items: FaqItem[] }> {
  const all = getFaq(locale);
  return FAQ_CATEGORIES.map((category) => ({ category, items: all.filter((f) => f.category === category) })).filter((g) => g.items.length > 0);
}

/** Normalised question text for duplicate detection between sources. */
export function faqKey(question: string): string {
  return question.toLowerCase().replace(/[^\w\u00c0-\u024f]+/g, ' ').trim();
}

/** Merge FAQ lists, dropping later entries whose question duplicates an earlier one. */
export function mergeFaqEntries<T extends { question: string }>(...lists: T[][]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const list of lists) for (const e of list) { const k = faqKey(e.question); if (seen.has(k)) continue; seen.add(k); out.push(e); }
  return out;
}
