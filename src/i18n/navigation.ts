import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './config';

// Create navigation utilities that automatically handle locale prefixes
// This ensures all links include the current locale in the URL

export const {
  // Enhanced Link component that automatically adds locale prefix
  // Usage: <Link href="/products">Products</Link>
  // Output: /en/products or /nl/products depending on current locale
  Link,

  // Enhanced redirect function for server components
  // Usage: redirect('/products')
  // Redirects to: /en/products or /nl/products
  redirect,

  // Hook to get current pathname without locale prefix
  // Usage: const pathname = usePathname() // returns '/products' not '/en/products'
  usePathname,

  // Enhanced router for client-side navigation
  // Usage: router.push('/products') // navigates to /en/products
  useRouter,
} = createSharedPathnamesNavigation({
  locales,
  // Always show locale in URL (e.g., /en/products instead of /products)
  localePrefix: 'always',
});

// Type-safe locale parameter for pages
export type LocaleParams = {
  locale: (typeof locales)[number];
};

// Helper to generate localized paths for all locales (useful for sitemap)
export function generateLocalizedPaths(path: string): { locale: string; path: string }[] {
  return locales.map((locale) => ({
    locale,
    path: `/${locale}${path === '/' ? '' : path}`,
  }));
}

// Helper to get alternate language links for SEO
export function getAlternateLinks(
  path: string,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://resound.be'
): { hrefLang: string; href: string }[] {
  const links: { hrefLang: string; href: string }[] = locales.map((locale) => ({
    hrefLang: locale as string,
    href: `${baseUrl}/${locale}${path === '/' ? '' : path}`,
  }));

  // Add x-default for the default locale
  links.push({
    hrefLang: 'x-default',
    href: `${baseUrl}/${defaultLocale}${path === '/' ? '' : path}`,
  });

  return links;
}

// Helper for canonical URL
export function getCanonicalUrl(
  locale: string,
  path: string,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://resound.be'
): string {
  return `${baseUrl}/${locale}${path === '/' ? '' : path}`;
}
