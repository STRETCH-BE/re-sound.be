import { getLocale, getTranslations } from 'next-intl/server';

import type { DocumentId, Product } from '@/data/products';
import { resolveDocuments } from '@/lib/documents';
import GatedDownloadButton from './GatedDownloadButton';
import Icon, { type IconName } from '@/components/ui/Icon';

interface ProductDownloadsProps {
  product: Product;
  tag: string;
  title: string;
  intro?: string;
}

/** Message keys (under `productPage.downloads`) per document id. */
const LABEL_KEY: Record<DocumentId, string> = {
  datasheet: 'productDataSheet',
  'material-datasheet': 'materialDatasheet',
  'installation-guide': 'installationGuide',
  'installation-manual': 'installationManual',
  'acoustic-test-report': 'acousticTestReport',
  'colour-finish-guide': 'colourFinishGuide',
  'fire-certificate': 'fireCertificate',
  'sustainability-declaration': 'sustainabilityDeclaration',
  warranty: 'warranty',
  'cad-drawing': 'cadDrawing',
};

const ICON: Record<DocumentId, IconName> = {
  datasheet: 'document',
  'material-datasheet': 'document',
  'installation-guide': 'wrench',
  'installation-manual': 'list',
  'acoustic-test-report': 'chart',
  'colour-finish-guide': 'palette',
  'fire-certificate': 'flame',
  'sustainability-declaration': 'recycle',
  warranty: 'shield',
  'cad-drawing': 'ruler',
};

/**
 * Downloads — server component.
 *
 * One card per document that exists under public/documents (resolved for the
 * page locale by src/lib/documents.ts). Every card opens the lead form; the
 * document is then e-mailed to the visitor by /api/document, so no PDF is
 * linked openly here. The card is the only client island of the block.
 */
export default async function ProductDownloads({ product, tag, title, intro }: ProductDownloadsProps) {
  const [t, locale] = await Promise.all([getTranslations('productPage.downloads'), getLocale()]);
  const documents = resolveDocuments(product, locale);
  if (documents.length === 0) return null;

  return (
    <section id="downloads" className="ps-section ps-downloads">
      <div className="ps-header">
        <span className="section-tag">{tag}</span>
        <h2>{title}</h2>
        <p>{intro ?? t('gatedIntro')}</p>
      </div>

      <ul className="ps-downloads-grid">
        {documents.map((doc) => (
          <li key={doc.id}>
            <GatedDownloadButton
              slug={product.slug}
              documentId={doc.id}
              label={t(LABEL_KEY[doc.id])}
              icon={<Icon name={ICON[doc.id]} size={26} />}
              format={doc.format}
              hint={t('emailHint')}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
