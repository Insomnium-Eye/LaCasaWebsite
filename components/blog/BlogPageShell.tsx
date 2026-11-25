'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

/** Light reading layout shared by /blog and /blog/[slug]. */
export default function BlogPageShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { language } = useLanguage();
  const es = language === 'es';

  return (
    <div className="min-h-screen bg-[#faf7f2] text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#faf7f2]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold text-slate-900">La Casa Oaxaca</Link>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link href="/blog" className="rounded-full px-4 py-2 text-slate-700 transition hover:bg-slate-200/70 hover:text-slate-900">Blog</Link>
            <Link href="/rides" className="rounded-full px-4 py-2 text-slate-700 transition hover:bg-slate-200/70 hover:text-slate-900">
              {es ? 'Transporte' : 'Rides'}
            </Link>
          </nav>
        </div>
      </header>
      <main className={`mx-auto px-4 pb-24 pt-10 sm:px-6 ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}>{children}</main>
    </div>
  );
}
