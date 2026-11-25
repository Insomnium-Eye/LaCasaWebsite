'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { getAllPosts } from '@/lib/blog';
import BlogPostCard from './BlogPostCard';
import BlogArchive from './BlogArchive';

/** /blog: newest post featured, then the rest, with the archive alongside. */
export default function BlogIndex() {
  const { language } = useLanguage();
  const es = language === 'es';
  const [latest, ...older] = getAllPosts();

  return (
    <>
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-garden">Blog</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
          {es ? 'Historias desde Oaxaca' : 'Stories from Oaxaca'}
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          {es
            ? 'Cada semana compartimos un lugar, un paseo o un rincón de Oaxaca que nos gusta, con fotos propias.'
            : 'Each week we share a place, a walk or a corner of Oaxaca we love, with our own photos.'}
        </p>
      </header>

      {!latest ? (
        <p className="mt-10 text-slate-500">{es ? 'Pronto habrá publicaciones.' : 'Posts are coming soon.'}</p>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-6">
            <BlogPostCard post={latest} eyebrow={es ? 'Lo más reciente' : 'Latest'} />
            {older.map((post) => <BlogPostCard key={post.slug} post={post} />)}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BlogArchive />
          </aside>
        </div>
      )}
    </>
  );
}
