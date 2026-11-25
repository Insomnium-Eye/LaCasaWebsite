'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatArchiveMonth, formatPostDate, getArchive } from '@/lib/blog';

/** Every post, grouped by year and month. */
export default function BlogArchive() {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const archive = getArchive();

  return (
    <nav aria-label={lang === 'es' ? 'Archivo' : 'Archive'} className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">{lang === 'es' ? 'Archivo' : 'Archive'}</h2>
      {archive.map((year) => (
        <div key={year.year} className="mt-4">
          <h3 className="text-sm font-bold text-slate-900">{year.year}</h3>
          {year.months.map((month) => (
            <div key={month.key} className="mt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formatArchiveMonth(month.key, lang)}</p>
              <ul className="mt-1 space-y-2">
                {month.posts.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="block text-sm leading-snug text-slate-700 hover:text-garden">
                      {post.title[lang]}
                      <time dateTime={post.date} className="block text-xs text-slate-400">{formatPostDate(post.date, lang)}</time>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}
