// Shared logic for the technical hub route. Generates all membrane×topic pages,
// supplies per-page metadata + BreadcrumbList (and FAQPage on the faq topic).
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl, brand } from '@/lib/site-config';
import { localeBase, buildAlternates } from '@/lib/seo';
import { breadcrumbSchema, faqPageSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import { getProduct } from '@/lib/products';
import {
  techMembranes,
  techTopics,
  techTopicKeys,
  isTechMembrane,
  isTechTopic,
  type TechMembraneKey,
  type TechTopicKey,
} from '@/lib/technical';
import { localizeTechMembrane, type TechMembraneMessages } from '@/lib/localize-content';
import type { Faq } from '@/lib/content';
import TechnicalPage from '@/components/sections/TechnicalPage';

export function technicalParams() {
  const out: { membrane: string; topic: string }[] = [];
  for (const membrane of Object.keys(techMembranes)) {
    for (const topic of techTopicKeys) out.push({ membrane, topic });
  }
  return out;
}

export async function technicalMetadata(membrane: string, topic: string, locale: string): Promise<Metadata> {
  if (!isValidLocale(locale) || !isTechMembrane(membrane) || !isTechTopic(topic)) return {};
  const tt = await getTranslations({ locale, namespace: 'technical' });
  const tm = await getTranslations({ locale, namespace: 'techPage' });
  const m = localizeTechMembrane(techMembranes[membrane], tt.raw(membrane) as TechMembraneMessages);
  const topicIdx = techTopics.findIndex((t) => t.key === topic);
  const topicLabel = tt(`topics.${topicIdx}.label`);
  const title = `${topicLabel} — ${m.label} | ${brand.name}`;
  const description = tm(`meta.${topic}`, { label: m.label });
  const route = `/technical/${membrane}/${topic}`;
  const ogImg = `${localeBase(locale as Locale)}/api/og`;
  return {
    title: { absolute: title },
    description,
    alternates: buildAlternates(locale as Locale, route),
    openGraph: {
      type: 'website',
      siteName: brand.name,
      title,
      description,
      url: `${localeBase(locale)}${route}`,
      images: [{ url: ogImg, width: 1200, height: 630, alt: brand.name }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImg] },
  };
}

export function TechnicalView({ membrane, topic, locale }: { membrane: string; topic: string; locale: string }) {
  if (!isTechMembrane(membrane) || !isTechTopic(topic)) notFound();
  if (isValidLocale(locale)) setRequestLocale(locale as Locale);
  const loc = (isValidLocale(locale) ? locale : 'en') as Locale;
  return <TechnicalBody membrane={membrane as TechMembraneKey} topic={topic as TechTopicKey} locale={loc} />;
}

// Split so useTranslations runs after setRequestLocale (next-intl RSC pattern).
function TechnicalBody({ membrane, topic, locale }: { membrane: TechMembraneKey; topic: TechTopicKey; locale: Locale }) {
  const tt = useTranslations('technical');
  const tp = useTranslations('productPage');
  const tf = useTranslations('catalogFaqs');
  const m = localizeTechMembrane(techMembranes[membrane], tt.raw(membrane) as TechMembraneMessages);
  const topicIdx = techTopics.findIndex((t) => t.key === topic);
  const product = getProduct(m.productSlug);
  const faqs = product ? ((tf.raw(product.key) as Faq[] | undefined) ?? product.faqs) : [];

  const crumbs = breadcrumbSchema([
    { name: tp('home'), url: `${localeBase(locale)}` },
    { name: m.short, url: `${localeBase(locale)}/technical/${membrane}/datasheet` },
    { name: tt(`topics.${topicIdx}.label`), url: `${localeBase(locale)}/technical/${membrane}/${topic}` },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />
      {topic === 'faq' && product && <JsonLd data={faqPageSchema(faqs)} />}
      <TechnicalPage membrane={membrane} topic={topic} />
    </>
  );
}
