/**
 * Which file a product document card points at.
 *
 * Michael uploads documents to public/documents/<slug>/ under his own names,
 * re-sound-<slug or family>-<document id>-<locale>.pdf (for example
 * re-sound-rwood-groove-datasheet-en.pdf, re-sound-rwood-colour-finish-guide-en.pdf
 * for every rWood product). Older files keep the legacy name
 * <document id>.<ext>. This module maps a product's document list
 * (src/data/products.ts) to the files that actually exist, so a card is only
 * shown for a document that can be sent, and /api/document never e-mails a
 * path it did not resolve itself.
 *
 * Preference order inside the document's folder: the page locale's upload,
 * the English upload, the legacy file. Server only (reads public/).
 */
import 'server-only';

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { PRODUCTS, type DocumentId, type Product, type ProductDocument } from '@/data/products';

export interface ResolvedDocument {
  id: DocumentId;
  /** Root-relative path under public/, e.g. /documents/rwood-groove/re-sound-rwood-groove-datasheet-en.pdf */
  file: string;
  /** 'PDF', 'DWG' … for the card */
  format: string;
  /** Locale of the upload when the name carries one, else null (legacy file) */
  locale: string | null;
}

const PUBLIC_DIR = join(process.cwd(), 'public');
const listings = new Map<string, string[]>();

function filesIn(dir: string): string[] {
  const cached = listings.get(dir);
  if (cached) return cached;
  let names: string[] = [];
  try {
    names = readdirSync(join(PUBLIC_DIR, dir));
  } catch {
    names = [];
  }
  listings.set(dir, names);
  return names;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Resolve one document of a product for a page locale; null when no file exists. */
export function resolveDocument(product: Product, doc: ProductDocument, locale: string): ResolvedDocument | null {
  const dir = doc.file.slice(0, doc.file.lastIndexOf('/')); // "/documents/<slug>"
  const id = doc.resolveAs ?? doc.id;
  const names = filesIn(dir.replace(/^\//, ''));
  const uploaded = (lang: string) =>
    names.find((n) => new RegExp(`^re-sound-.+-${escapeRe(id)}-${escapeRe(lang)}\\.(pdf|dwg)$`, 'i').test(n));
  const lang = locale.trim().toLowerCase();
  const own = lang && lang !== 'en' ? uploaded(lang) : undefined;
  const en = uploaded('en');
  if (own || en) {
    const name = (own ?? en) as string;
    return { id: doc.id, file: `${dir}/${name}`, format: name.split('.').pop()!.toUpperCase(), locale: own ? lang : 'en' };
  }
  if (existsSync(join(PUBLIC_DIR, doc.file))) {
    return { id: doc.id, file: doc.file, format: doc.file.split('.').pop()!.toUpperCase(), locale: null };
  }
  return null;
}

/** Every document of a product that has a file, in the product's order. */
export function resolveDocuments(product: Product, locale: string): ResolvedDocument[] {
  return product.documents.flatMap((doc) => {
    const resolved = resolveDocument(product, doc, locale);
    return resolved ? [resolved] : [];
  });
}

/** For /api/document: the file behind (slug, document id) or null when unknown. */
export function findDocument(slug: string, id: string, locale: string): { product: Product; document: ResolvedDocument } | null {
  const product = (PRODUCTS as Record<string, Product | undefined>)[slug];
  if (!product) return null;
  const doc = product.documents.find((d) => d.id === id);
  if (!doc) return null;
  const document = resolveDocument(product, doc, locale);
  return document ? { product, document } : null;
}
