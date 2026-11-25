'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLatestPost } from '@/lib/blog';
import BlogPostContent from './BlogPostContent';

/** Home page pop-up showing the most recent blog post in full. */
export default function BlogLatestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { language } = useLanguage();
  const es = language === 'es';
  const post = getLatestPost();
  const closeRef = useRef<HTMLButtonElement>(null);
  // Read through a ref so a new onClose each parent render doesn't re-run the setup below.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', onKey);
    // Keep the page behind from scrolling while reading.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={es ? 'Blog: publicación más reciente' : 'Blog: latest post'}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-[#faf7f2] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-garden">{es ? 'Del blog' : 'From the blog'}</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={es ? 'Cerrar' : 'Close'}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <span className="text-xl leading-none">✕</span>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-6 sm:px-10 sm:py-8">
          <BlogPostContent post={post} titleAs="h2" />
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/blog" className="font-semibold text-garden hover:text-[#3c5a35]">
            {es ? 'Todas las publicaciones y archivo →' : 'All posts & archive →'}
          </Link>
          <Link href={`/blog/${post.slug}`} className="text-slate-500 hover:text-slate-900">
            {es ? 'Abrir como página' : 'Open as a page'}
          </Link>
        </div>
      </div>
    </div>
  );
}
