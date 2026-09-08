import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import FaqList from '@/components/faq/FaqList';
import JsonLd from '@/components/seo/JsonLd';
import { FAQ_CATEGORIES, faqByCategoryResolved, mergeFaqEntries, type FaqCategory } from '@/lib/content/faq';
import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';
import { faqPageSchema, type FaqEntry } from '@/lib/structured-data';

interface PageProps {
  params: { locale: string };
}

/**
 * The 14 original questions (messages: faq.questions.*) are kept and merged
 * into the workbook categories; duplicates (same question) are dropped.
 */
const LEGACY_KEYS = [
  'absorptionVsInsulation', 'whatIsReverberation', 'whatInfluencesAcoustics', 'whatIsAlphaW', 'howManyPanels', 'whereCanUse',
  'rwoodVsRpetVsTextile', 'fireSafety', 'samples', 'whatIsCircular', 'takeBack', 'recycledContent', 'leadTimes', 'quoteProcess',
] as const;
const LEGACY_CATEGORY: Record<string, FaqCategory> = { acoustics: 'General', products: 'General', sustainability: 'General', commercial: 'Ordering' };

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: { absolute: t('faqTitle') },
    description: t('faqDescription'),
    openGraph: {
      title: t('faqTitle'),
      description: t('faqDescription'),
      type: 'website',
      images: [{ url: `/api/og?page=faq&locale=${locale}`, width: 1200, height: 630, alt: t('faqTitle') }],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
    },
    twitter: { card: 'summary_large_image', title: t('faqTitle'), description: t('faqDescription') },
    alternates: buildAlternates(locale, '/faq'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'faq' });

  // Workbook entries grouped by category, then the legacy questions appended
  // to their category (same-question duplicates dropped).
  const groups = new Map<FaqCategory, FaqEntry[]>(FAQ_CATEGORIES.map((c) => [c, []]));
  for (const g of (await faqByCategoryResolved(locale))) groups.get(g.category)!.push(...g.items.map((i) => ({ question: i.question, answer: i.answer })));
  for (const key of LEGACY_KEYS) {
    const category = LEGACY_CATEGORY[t(`questions.${key}.category`)] ?? 'General';
    groups.get(category)!.push({ question: t(`questions.${key}.question`), answer: t(`questions.${key}.answer`) });
  }
  const sections = FAQ_CATEGORIES.map((category) => ({ category, entries: mergeFaqEntries(groups.get(category)!) })).filter((s) => s.entries.length > 0);
  const all = mergeFaqEntries(...sections.map((s) => s.entries));

  return (
    <>
      {/* One FAQPage node with exactly the questions shown on this page */}
      <JsonLd data={faqPageSchema(all)} />
      <section className="faq-page">
        <h1>{t('title')}</h1>
        <p className="faq-page-intro">{t('subtitle')}</p>
        <ul className="faq-toc" aria-label={t('categoriesLabel')}>
          {sections.map((s) => (
            <li key={s.category}>
              <a href={`#faq-${s.category.toLowerCase()}`}>{t(`groups.${s.category}`)}</a>
            </li>
          ))}
        </ul>
        {sections.map((s) => (
          <section key={s.category} className="faq-group" id={`faq-${s.category.toLowerCase()}`} aria-labelledby={`faq-${s.category.toLowerCase()}-title`}>
            <h2 id={`faq-${s.category.toLowerCase()}-title`}>{t(`groups.${s.category}`)}</h2>
            <FaqList entries={s.entries} />
          </section>
        ))}
      </section>
    </>
  );
}
