import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getTranslations } from 'next-intl/server';

import type { DocumentId, Product } from '@/data/products';
import GatedDownloadButton from './GatedDownloadButton';

interface ProductDownloadsProps {
  product: Product;
  tag: string;
  title: string;
  intro?: string;
}

/** Message keys (under `productPage.downloads`) per document id. */
const LABEL_KEY: Record<DocumentId, string> = {
  datasheet: 'productDataSheet',
  'installation-guide': 'installationGuide',
  'installation-manual': 'installationManual',
  'acoustic-test-report': 'acousticTestReport',
  'colour-finish-guide': 'colourFinishGuide',
  'fire-certificate': 'fireCertificate',
  'sustainability-declaration': 'sustainabilityDeclaration',
  warranty: 'warranty',
  'cad-drawing': 'cadDrawing',
};

const ICON: Record<DocumentId, string> = {
  datasheet: '📄',
  'installation-guide': '🔧',
  'installation-manual': '📋',
  'acoustic-test-report': '📊',
  'colour-finish-guide': '🎨',
  'fire-certificate': '🔥',
  'sustainability-declaration': '♻️',
  warranty: '🛡️',
  'cad-drawing': '📐',
};

/**
 * Downloads — server component.
 *
 * Every PDF is an open `<a href download>` link (crawlable, no lead form).
 * Only gated files (BIM/DWG) go through the existing lead-gen modal, via
 * the small client component <GatedDownloadButton>.
 */
/** Open files are only linked when they exist under public/ (see docs/missing-documents.md). */
function isAvailable(file: string, gated?: boolean): boolean {
  return Boolean(gated) || existsSync(join(process.cwd(), 'public', file));
}

export default async function ProductDownloads({ product, tag, title, intro }: ProductDownloadsProps) {
  const t = await getTranslations('productPage.downloads');
  const documents = product.documents.filter((doc) => isAvailable(doc.file, doc.gated));
  if (documents.length === 0) return null;

  return (
    <section id="downloads" className="ps-section ps-downloads">
      <div className="ps-header">
        <span className="section-tag">{tag}</span>
        <h2>{title}</h2>
        {intro && <p>{intro}</p>}
      </div>

      <ul className="ps-downloads-grid">
        {documents.map((doc) => {
          const label = t(LABEL_KEY[doc.id]);
          const ext = doc.file.split('.').pop()?.toUpperCase() ?? 'PDF';
          return (
            <li key={doc.id}>
              {doc.gated ? (
                <GatedDownloadButton
                  slug={product.slug}
                  file={doc.file}
                  label={label}
                  icon={ICON[doc.id]}
                  format={ext}
                  hint={t('gatedHint')}
                />
              ) : (
                <a href={doc.file} download className="ps-download-card">
                  <span className="ps-download-icon" aria-hidden="true">{ICON[doc.id]}</span>
                  <span className="ps-download-info">
                    <span className="ps-download-label">{label}</span>
                    <span className="ps-download-meta">{ext}</span>
                  </span>
                  <span className="ps-download-arrow" aria-hidden="true">↓</span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
