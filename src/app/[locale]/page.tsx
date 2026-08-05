// Homepage. Assembles the home sections in mockup order (light → dark → red
// rhythm) and emits Organization, WebSite and LocalBusiness JSON-LD. Metadata
// for "/" comes from the locale layout; this route relies on that default.
import { setRequestLocale } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import JsonLd from '@/components/seo/JsonLd';
import { organizationSchema, websiteSchema, localBusinessSchema } from '@/lib/structured-data';

import Hero from '@/components/sections/home/Hero';
import { Ticker, Stats } from '@/components/sections/home/TickerStats';
import WhyStretch from '@/components/sections/home/WhyStretch';
import Solutions from '@/components/sections/home/Solutions';
import Acoustics from '@/components/sections/home/Acoustics';
import ApplicationAreas from '@/components/sections/home/ApplicationAreas';
import InstallerPartner from '@/components/sections/home/InstallerPartner';
import Gallery from '@/components/sections/home/Gallery';
import Reviews from '@/components/sections/home/Reviews';
import CtaBand from '@/components/sections/home/CtaBand';

export default function HomePage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema({ hasSearch: false })} />
      <JsonLd data={localBusinessSchema()} />

      <Hero />
      <Ticker />
      <Stats />
      <WhyStretch />
      <Solutions />
      <Acoustics />
      <ApplicationAreas />
      <InstallerPartner />
      <Gallery />
      <Reviews />
      <CtaBand />
    </>
  );
}
