#!/usr/bin/env node
/**
 * Writes src/data/generated/blog-slugs.json: the editorial blog slugs per
 * locale (content/blog/<locale>/*.md, drafts included — they render as
 * noindex previews), read from each file's frontmatter `slug`.
 *
 *   npm run blog:slugs               (also runs in "prebuild" and before "dev")
 *
 * The middleware (src/middleware.ts via src/lib/routes.ts) needs this list at
 * the edge, where the filesystem is not available, to send an unknown
 * /<locale>/blog/<slug> to the locale's blog index with a real 301 instead
 * of rendering the page on demand (a redirect thrown during on-demand static
 * generation is cached without its Location header, and a dynamic bail-out
 * is a 500 there). Deterministic: sorted, so the file only changes when a
 * post is added, renamed or removed.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'content', 'blog');
const OUT = join(ROOT, 'src', 'data', 'generated', 'blog-slugs.json');

const slugs = {};
for (const entry of readdirSync(CONTENT_DIR, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
  if (!entry.isDirectory()) continue;
  const dir = join(CONTENT_DIR, entry.name);
  const list = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data } = matter(readFileSync(join(dir, f), 'utf8'));
      const slug = data.slug ? String(data.slug) : null;
      if (slug && `${slug}.md` !== f) {
        throw new Error(`content/blog/${entry.name}/${f}: frontmatter slug "${slug}" does not match the file name`);
      }
      return slug;
    })
    .filter(Boolean)
    .sort();
  if (list.length) slugs[entry.name] = list;
}

if (!existsSync(dirname(OUT))) mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(slugs, null, 2) + '\n');
console.log(
  `blog-slugs: ${Object.entries(slugs).map(([l, s]) => `${l} ${s.length}`).join(', ')} → ${OUT.replace(ROOT + '/', '')}`,
);
