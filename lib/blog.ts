import { BLOG_POSTS } from '@/data/blog';
import { BlogPost } from '@/types/blog';

/** All posts, newest first (ties broken by slug so the order is stable). */
export const getAllPosts = (): BlogPost[] =>
  [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

export const getLatestPost = (): BlogPost | null => getAllPosts()[0] ?? null;

export const getPostBySlug = (slug: string): BlogPost | null => BLOG_POSTS.find((p) => p.slug === slug) ?? null;

/** The posts either side of `slug` by date: `older` is the previous post, `newer` the next. */
export const getAdjacentPosts = (slug: string): { older: BlogPost | null; newer: BlogPost | null } => {
  const posts = getAllPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { older: null, newer: null };
  return { newer: posts[i - 1] ?? null, older: posts[i + 1] ?? null };
};

export interface ArchiveMonth {
  /** YYYY-MM */
  key: string;
  posts: BlogPost[];
}

export interface ArchiveYear {
  year: string;
  months: ArchiveMonth[];
}

/** Posts grouped by year, then month, newest first. */
export const getArchive = (): ArchiveYear[] => {
  const years: ArchiveYear[] = [];
  for (const post of getAllPosts()) {
    const year = post.date.slice(0, 4);
    const key = post.date.slice(0, 7);
    let y = years.find((x) => x.year === year);
    if (!y) years.push((y = { year, months: [] }));
    let m = y.months.find((x) => x.key === key);
    if (!m) y.months.push((m = { key, posts: [] }));
    m.posts.push(post);
  }
  return years;
};

// Dates are calendar dates; format at noon UTC so no timezone can shift the day.
const asDate = (isoDate: string) => new Date(`${isoDate.slice(0, 10)}T12:00:00Z`);
const locale = (language: string) => (language === 'es' ? 'es-MX' : 'en-US');

/** "November 25, 2026" / "25 de noviembre de 2026" */
export const formatPostDate = (isoDate: string, language: string) =>
  asDate(isoDate).toLocaleDateString(locale(language), { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

/** "November 2026" / "noviembre de 2026" (archive headings; takes YYYY-MM or YYYY-MM-DD) */
export const formatArchiveMonth = (yearMonth: string, language: string) =>
  asDate(`${yearMonth.slice(0, 7)}-01`).toLocaleDateString(locale(language), { year: 'numeric', month: 'long', timeZone: 'UTC' });
