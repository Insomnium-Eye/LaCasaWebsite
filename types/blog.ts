/** Blog post types. Posts themselves live in data/blog.ts. */

export interface Bilingual {
  en: string;
  es: string;
}

export interface BlogImage {
  /** Path under public/, e.g. /imgs/blog/llano-grande/hero.jpg */
  src: string;
  width: number;
  height: number;
  alt: Bilingual;
  caption: Bilingual;
}

/**
 * Body content, rendered in order. Paragraph, list and CTA text support two
 * inline marks: **bold** and [link text](/internal-path or https://…).
 */
export type BlogBlock =
  | { type: 'heading'; text: Bilingual }
  | { type: 'paragraph'; text: Bilingual }
  | { type: 'list'; items: Bilingual[] }
  | { type: 'image'; image: BlogImage }
  | { type: 'cta'; heading: Bilingual; text: Bilingual; label: Bilingual; href: string };

export interface BlogPost {
  /** URL slug: /blog/<slug>. Never change it once published. */
  slug: string;
  /** Publication date, YYYY-MM-DD (Oaxaca date). Posts are ordered by this. */
  date: string;
  title: Bilingual;
  /** Search-engine description, under 160 characters. */
  description: Bilingual;
  /** Short intro shown on cards and at the top of the post. */
  intro: Bilingual;
  hero: BlogImage;
  blocks: BlogBlock[];
}
