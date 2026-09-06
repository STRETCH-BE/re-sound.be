/**
 * Blog grid entries. The four legacy posts are message-driven
 * (blogPosts.<slug>.* in every locale); editorial posts from content/blog
 * carry their own copy. Kept in a plain module so both the server page and
 * the client grid can import it (a client module's named export cannot be
 * spread on the server).
 */
export interface BlogGridPost {
  slug: string;
  category: string;
  date: string;
  /** Editorial posts carry their own copy; legacy posts read blogPosts.<slug>.* */
  title?: string;
  excerpt?: string;
  image?: string;
  imageAlt?: string;
}

// Keep in sync with `generateStaticParams` in `[locale]/blog/[slug]/page.tsx`
export const LEGACY_POSTS: BlogGridPost[] = [
  { slug: 'circular-economy-acoustics', category: 'sustainability', date: '2024-01-15' },
  { slug: 'office-acoustic-solutions', category: 'products', date: '2024-01-10' },
  { slug: 'recycled-materials-quality', category: 'materials', date: '2024-01-05' },
  { slug: 'sound-absorption-explained', category: 'education', date: '2024-01-01' },
];
