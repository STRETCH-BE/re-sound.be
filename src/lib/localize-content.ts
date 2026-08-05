// Overlay helpers for phase-3 translated content. Each takes the EN structural
// source (which keeps slugs, field names, images, options order, flags) and the
// raw translated entry from the corresponding messages namespace, and returns
// the same shape with display text replaced. All are no-ops when `raw` is
// missing, so EN renders unchanged.
import type { ModalConfig, FormField } from '@/lib/forms-config';
import type { Application } from '@/lib/applications';
import type { TechMembrane } from '@/lib/technical';
import type { PrefabPageData } from '@/lib/prefab';
import type { Project, BlogPost } from '@/lib/content';

// ---- Lead modals -----------------------------------------------------------
export type ModalMessages = {
  title: string;
  subtitle: string;
  submitLabel: string;
  sentTitle: string;
  sentMsg: string;
  fields: Record<string, { label: string; placeholder?: string; options?: string[] }>;
};

export function localizeModalConfig(cfg: ModalConfig, raw: ModalMessages | undefined): ModalConfig {
  if (!raw) return cfg;
  return {
    ...cfg,
    title: raw.title,
    subtitle: raw.subtitle,
    submitLabel: raw.submitLabel,
    sentTitle: raw.sentTitle,
    sentMsg: raw.sentMsg,
    fields: cfg.fields.map((f): FormField => {
      const m = raw.fields[f.name];
      if (!m) return f;
      return {
        ...f,
        label: m.label,
        placeholder: m.placeholder ?? f.placeholder,
        options: m.options ?? f.options,
      };
    }),
  };
}

// ---- Applications ----------------------------------------------------------
export type ApplicationMessages = Pick<
  Application,
  'name' | 'shortName' | 'eyebrow' | 'metaDescription' | 'intro' | 'benefits'
>;

export function localizeApplication(app: Application, raw: ApplicationMessages | undefined): Application {
  if (!raw) return app;
  return { ...app, ...raw };
}

// ---- Technical hub ---------------------------------------------------------
export type TechMembraneMessages = Pick<
  TechMembrane,
  'label' | 'short' | 'blurb' | 'fireSafety' | 'installation' | 'specification'
>;

export function localizeTechMembrane(m: TechMembrane, raw: TechMembraneMessages | undefined): TechMembrane {
  if (!raw) return m;
  return { ...m, ...raw };
}

// ---- Prefab pages ----------------------------------------------------------
// The messages entry mirrors PrefabPageData minus slug/hero/image/drawing/result
// (structural fields stripped at export). Deep-merge text back over the source
// so image slots and slugs survive.
type PrefabMessages = {
  name: string;
  eyebrow: string;
  metaDescription: string;
  intro: string;
  makeHeading: string;
  make: { title: string; body: string }[];
  materialsHeading: string;
  materials: { title: string; body: string }[];
  production?: { heading: string; body: string; details: { title: string; body: string }[] };
  showcase?: { heading: string; items: { title: string; meta?: string; summary: string }[] };
  worldwide: string;
};

// ---- Portfolio projects ------------------------------------------------------
// Messages entry mirrors the translatable Project fields; facts keep their href
// from the structural source. cat/meta are translated separately (projectCards).
export type ProjectMessages = {
  title: string;
  summary?: string;
  hook?: string;
  description?: string[];
  highlights?: string[];
  materials?: string[];
  facts?: { label: string; value: string }[];
  faqs?: { q: string; a: string }[];
};

export function localizeProject(project: Project, raw: ProjectMessages | undefined): Project {
  if (!raw) return project;
  return {
    ...project,
    title: raw.title,
    summary: raw.summary ?? project.summary,
    hook: raw.hook ?? project.hook,
    description: raw.description ?? project.description,
    highlights: raw.highlights ?? project.highlights,
    materials: raw.materials ?? project.materials,
    facts:
      project.facts && raw.facts
        ? project.facts.map((f, i) => ({ ...f, ...raw.facts![i] }))
        : project.facts,
    faqs: raw.faqs ?? project.faqs,
  };
}

// ---- Blog posts --------------------------------------------------------------
export type BlogPostMessages = Pick<BlogPost, 'title' | 'excerpt' | 'body'>;

export function localizeBlogPost(post: BlogPost, raw: BlogPostMessages | undefined): BlogPost {
  if (!raw) return post;
  return { ...post, title: raw.title, excerpt: raw.excerpt, body: raw.body };
}

export function localizePrefab(data: PrefabPageData, raw: PrefabMessages | undefined): PrefabPageData {
  if (!raw) return data;
  return {
    ...data,
    name: raw.name,
    eyebrow: raw.eyebrow,
    metaDescription: raw.metaDescription,
    intro: raw.intro,
    makeHeading: raw.makeHeading,
    make: raw.make,
    materialsHeading: raw.materialsHeading,
    materials: raw.materials,
    production:
      data.production && raw.production
        ? {
            heading: raw.production.heading,
            body: raw.production.body,
            details: data.production.details.map((d, i) => ({ ...d, ...raw.production!.details[i] })),
          }
        : data.production,
    showcase:
      data.showcase && raw.showcase
        ? {
            heading: raw.showcase.heading,
            items: data.showcase.items.map((s, i) => ({ ...s, ...raw.showcase!.items[i] })),
          }
        : data.showcase,
    worldwide: raw.worldwide,
  };
}
