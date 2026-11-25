'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPostDate } from '@/lib/blog';
import { BlogBlock, BlogImage, BlogPost } from '@/types/blog';
import InlineText, { isSafeHref } from './InlineText';
import BlogPostNav from './BlogPostNav';

type Lang = 'en' | 'es';

export function BlogFigure({ image, lang, priority = false }: { image: BlogImage; lang: Lang; priority?: boolean }) {
  const portrait = image.height > image.width;
  return (
    <figure className="my-8">
      <img
        src={image.src}
        width={image.width}
        height={image.height}
        alt={image.alt[lang]}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`rounded-2xl bg-slate-200 ${portrait ? 'mx-auto h-auto max-h-[75vh] w-auto' : 'h-auto w-full'}`}
      />
      <figcaption className="mt-2 text-center text-sm italic text-slate-500">{image.caption[lang]}</figcaption>
    </figure>
  );
}

function Block({ block, lang }: { block: BlogBlock; lang: Lang }) {
  switch (block.type) {
    case 'heading':
      return <h2 className="mt-10 text-2xl font-semibold text-slate-900">{block.text[lang]}</h2>;
    case 'paragraph':
      return <p className="mt-4 leading-8 text-slate-700"><InlineText text={block.text[lang]} /></p>;
    case 'list':
      return (
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-8 text-slate-700 marker:text-garden">
          {block.items.map((item, i) => <li key={i}><InlineText text={item[lang]} /></li>)}
        </ul>
      );
    case 'image':
      return <BlogFigure image={block.image} lang={lang} />;
    case 'cta':
      return (
        <aside className="mt-12 rounded-3xl border border-garden/30 bg-[#f0f4f1] p-6 text-center sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">{block.heading[lang]}</h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-700">{block.text[lang]}</p>
          {isSafeHref(block.href) && (
            <Link
              href={block.href}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-garden px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#3c5a35]"
            >
              {block.label[lang]} →
            </Link>
          )}
        </aside>
      );
  }
}

/**
 * A full blog post: date, title, intro, hero photo, body and previous/next
 * links. Used by the post page and the home page pop-up. Light theme, so
 * place it on a light background.
 */
export default function BlogPostContent({ post, titleAs: Title = 'h1' }: { post: BlogPost; titleAs?: 'h1' | 'h2' }) {
  const { language } = useLanguage();
  const lang: Lang = language === 'es' ? 'es' : 'en';

  return (
    <article className="text-slate-800">
      <header>
        <time dateTime={post.date} className="text-sm font-semibold uppercase tracking-[0.15em] text-terracotta">
          {formatPostDate(post.date, lang)}
        </time>
        <Title className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">{post.title[lang]}</Title>
        <p className="mt-5 text-lg leading-8 text-slate-700">{post.intro[lang]}</p>
      </header>
      <BlogFigure image={post.hero} lang={lang} priority />
      {post.blocks.map((block, i) => <Block key={i} block={block} lang={lang} />)}
      <BlogPostNav slug={post.slug} />
    </article>
  );
}
