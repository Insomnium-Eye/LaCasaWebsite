'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPostDate } from '@/lib/blog';
import { BlogPost } from '@/types/blog';

interface BlogPostCardProps {
  post: BlogPost;
  /** Opens something in place (e.g. the home page pop-up). Otherwise the card links to the post page. */
  onOpen?: () => void;
  /** Small label above the date, e.g. "From the blog". */
  eyebrow?: string;
  variant?: 'dark' | 'light';
}

/** Teaser card: photo, date, title and intro. Used on the home page and the /blog page. */
export default function BlogPostCard({ post, onOpen, eyebrow, variant = 'light' }: BlogPostCardProps) {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const dark = variant === 'dark';

  const body = (
    <>
      <div className="overflow-hidden md:w-2/5 md:shrink-0">
        <img
          src={post.hero.src}
          width={post.hero.width}
          height={post.hero.height}
          alt={post.hero.alt[lang]}
          loading="lazy"
          decoding="async"
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105 md:h-full"
        />
      </div>
      <div className="flex flex-col justify-center p-6 text-left sm:p-8">
        {eyebrow && (
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? 'text-adobe' : 'text-garden'}`}>{eyebrow}</p>
        )}
        <time dateTime={post.date} className="mt-1 text-sm font-semibold text-terracotta">
          {formatPostDate(post.date, lang)}
        </time>
        <h3 className={`mt-2 text-2xl font-semibold leading-snug ${dark ? 'text-white' : 'text-slate-900'}`}>{post.title[lang]}</h3>
        <p className={`mt-3 line-clamp-3 leading-7 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{post.intro[lang]}</p>
        <span className={`mt-4 text-sm font-semibold ${dark ? 'text-adobe' : 'text-garden'}`}>
          {lang === 'es' ? 'Leer publicación →' : 'Read the post →'}
        </span>
      </div>
    </>
  );

  const className = `group flex w-full flex-col overflow-hidden rounded-4xl border shadow-sm transition md:flex-row ${
    dark
      ? 'border-slate-700 bg-[#231a13]/90 shadow-black/10 hover:border-slate-500'
      : 'border-slate-200 bg-white hover:border-garden/50 hover:shadow-md'
  }`;

  return onOpen ? (
    <button type="button" onClick={onOpen} className={className}>{body}</button>
  ) : (
    <Link href={`/blog/${post.slug}`} className={className}>{body}</Link>
  );
}
