import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import SamplesForm from '@/components/samples/SamplesForm';
import { SAMPLE_FAMILIES, sampleRanges, type SampleFamily } from '@/components/samples/sampleRanges';
import PageHero from '@/components/sections/PageHero';
import JsonLd from '@/components/seo/JsonLd';
import Icon, { type IconName } from '@/components/ui/Icon';
import { hubPath } from '@/data/hubs';
import { Link } from '@/i18n/navigation';
import { pickMessages } from '@/lib/i18n-messages';
import { buildAlternates, ogAlternateLocales, ogLocale } from '@/lib/seo';
import { faqPageSchema, type FaqEntry } from '@/lib/structured-data';

interface SamplesPageProps {
  params: { locale: string };
}

/** The three "what is in the kit" cards: message key + decorative icon. */
const KIT_ITEMS: ReadonlyArray<{ key: 'swatches' | 'shipping' | 'project'; icon: IconName }> = [
  { key: 'swatches', icon: 'layers' },
  { key: 'shipping', icon: 'box' },
  { key: 'project', icon: 'target' },
];

const FAQ_COUNT = 3;

export async function generateMetadata({ params: { locale } }: SamplesPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'samples' });
  const title = t('metaTitle');
  const description = t('metaDescription');

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Re-Sound`,
      description,
      images: [`/api/og?locale=${locale}&page=samples`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
    },
    alternates: buildAlternates(locale, '/samples'),
  };
}

/**
 * Sample-kit page (server component). Hero, what is in the kit, the ranges
 * per family (names from src/data/products.ts), the request form as a client
 * island, and a short FAQ with native details/summary. The FAQ entries feed
 * the FAQPage JSON-LD so the structured data matches visible content.
 *
 * Styles: the shared .ps-* / .section-tag / .btn-* classes plus a small
 * page-scoped block below (server component, so no styled-jsx).
 */
export default async function SamplesPage({ params: { locale } }: SamplesPageProps) {
  // Enable static rendering — must be called before any other next-intl functions
  setRequestLocale(locale);

  const t = await getTranslations('samples');
  const messages = pickMessages(await getMessages(), ['samples', 'sampleKit']);

  // Family heading links: the rWood and rPET hubs; textile has no hub yet.
  const familyHref: Record<SampleFamily, string> = {
    textile: '/products',
    rwood: hubPath('rwood', locale),
    rpet: hubPath('rpet', locale),
  };

  const faq: FaqEntry[] = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    question: t(`faq.q${i + 1}`),
    answer: t(`faq.a${i + 1}`),
  }));

  return (
    <>
      <JsonLd data={faqPageSchema(faq)} />

      <PageHero tag={t('hero.tag')} title={t('hero.title')} subtitle={t('hero.subtitle')} />

      {/* ── What is in the kit ───────────────────────────────────── */}
      <section className="ps-section samples-kit" aria-labelledby="samples-kit-title">
        <div className="ps-header">
          <span className="section-tag">{t('kit.tag')}</span>
          <h2 id="samples-kit-title">{t('kit.title')}</h2>
        </div>
        <ul className="samples-kit-list">
          {KIT_ITEMS.map((item) => (
            <li key={item.key}>
              <Icon name={item.icon} size={28} />
              <h3>{t(`kit.${item.key}Title`)}</h3>
              <p>{t(`kit.${item.key}Text`)}</p>
            </li>
          ))}
        </ul>
        <p className="samples-kit-cta">
          <a href="#samples-form" className="btn-primary">{t('kit.cta')}</a>
        </p>
      </section>

      {/* ── Ranges in the kit ────────────────────────────────────── */}
      <section className="ps-section samples-ranges" aria-labelledby="samples-ranges-title">
        <div className="ps-header">
          <span className="section-tag">{t('ranges.tag')}</span>
          <h2 id="samples-ranges-title">{t('ranges.title')}</h2>
          <p>{t('ranges.text')}</p>
        </div>
        <div className="samples-ranges-grid">
          {SAMPLE_FAMILIES.map((family) => (
            <div className="samples-range" key={family}>
              <h3>
                <Link href={familyHref[family]} prefetch={false}>{t(`families.${family}`)}</Link>
              </h3>
              <ul>
                {sampleRanges(family).map((range) => (
                  <li key={range.id}>
                    <Link href={`/products/${range.id}`} prefetch={false}>{range.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Request form (client island) ─────────────────────────── */}
      <section className="ps-section samples-form-section" id="samples-form" aria-labelledby="samples-form-title">
        <div className="ps-header">
          <span className="section-tag">{t('form.tag')}</span>
          <h2 id="samples-form-title">{t('form.title')}</h2>
          <p>{t('form.text')}</p>
        </div>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SamplesForm />
        </NextIntlClientProvider>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section id="faq" className="ps-section ps-faq" aria-labelledby="samples-faq-title">
        <div className="ps-header">
          <span className="section-tag">{t('faq.tag')}</span>
          <h2 id="samples-faq-title">{t('faq.title')}</h2>
        </div>
        <div className="ps-faq-list">
          {faq.map((entry, i) => (
            <details key={i} className="ps-accordion ps-faq-item" open={i === 0}>
              <summary>
                <h3>{entry.question}</h3>
                <span className="ps-chevron" aria-hidden="true" />
              </summary>
              <p>{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <style>{SAMPLES_CSS}</style>
    </>
  );
}

const SAMPLES_CSS = `
.samples-kit { background: white; }
.samples-kit-list {
  list-style: none;
  margin: 0 auto;
  padding: 0;
  max-width: 1100px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.samples-kit-list li {
  background: var(--cream);
  border: 1px solid #e6ecf1;
  border-radius: var(--radius-md);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: var(--brand-blue);
}
.samples-kit-list h3 {
  font-size: 1.1rem;
  color: var(--deep-blue);
  margin: 0;
}
.samples-kit-list p {
  margin: 0;
  color: #555;
  line-height: 1.7;
  font-size: 0.95rem;
}
.samples-kit-cta {
  text-align: center;
  margin: 2.5rem 0 0;
}
.samples-ranges { background: var(--cream); }
.samples-ranges-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.samples-range {
  background: white;
  border: 1px solid #e6ecf1;
  border-radius: var(--radius-md);
  padding: 1.75rem;
}
.samples-range h3 {
  font-size: 1.15rem;
  color: var(--deep-blue);
  margin: 0 0 1rem;
}
.samples-range h3 a {
  color: inherit;
  text-decoration: none;
}
.samples-range h3 a:hover { color: var(--brand-blue); }
.samples-range ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.samples-range li a {
  color: var(--charcoal);
  text-decoration: none;
  font-size: 0.95rem;
}
.samples-range li a:hover {
  color: var(--brand-blue);
  text-decoration: underline;
}
.samples-form-section { background: white; }
@media (max-width: 900px) {
  .samples-kit-list,
  .samples-ranges-grid { grid-template-columns: 1fr; }
}
`;
