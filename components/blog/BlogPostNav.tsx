'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPostDate, getAdjacentPosts } from '@/lib/blog';

/**
 * "Previous post" / "Next post" links. Each side only appears when that post
 * exists, so with a single post nothing renders.
 */
export default function BlogPostNav({ slug }: { slug: string }) {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const { older, newer } = getAdjacentPosts(slug);
  if (!older && !newer) return null;

  const linkClass = 'group flex flex-col rounded-2xl border border-slate-200 p-4 transition hover:border-garden hover:bg-[#f0f4f1]';

  return (
    <nav aria-label={lang === 'es' ? 'Más publicaciones' : 'More posts'} className="mt-12 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-2">
      {older ? (
        <Link href={`/blog/${older.slug}`} className={linkClass}>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">← {lang === 'es' ? 'Anterior' : 'Previous'}</span>
          <span className="mt-1 font-semibold text-slate-900 group-hover:text-garden">{older.title[lang]}</span>
          <time dateTime={older.date} className="mt-1 text-xs text-slate-500">{formatPostDate(older.date, lang)}</time>
        </Link>
      ) : <span />}
      {newer && (
        <Link href={`/blog/${newer.slug}`} className={`${linkClass} sm:items-end sm:text-right`}>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{lang === 'es' ? 'Siguiente' : 'Next'} →</span>
          <span className="mt-1 font-semibold text-slate-900 group-hover:text-garden">{newer.title[lang]}</span>
          <time dateTime={newer.date} className="mt-1 text-xs text-slate-500">{formatPostDate(newer.date, lang)}</time>
        </Link>
      )}
    </nav>
  );
}
