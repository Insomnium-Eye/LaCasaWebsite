import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPageShell from '@/components/blog/BlogPageShell';
import BlogPostContent from '@/components/blog/BlogPostContent';
import { getAllPosts, getPostBySlug } from '@/lib/blog';

// Every post is built ahead of time; unknown slugs are a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPostBySlug((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title.en} | La Casa Oaxaca`,
    description: post.description.en,
    openGraph: {
      title: post.title.en,
      description: post.description.en,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: post.hero.src, width: post.hero.width, height: post.hero.height, alt: post.hero.alt.en }],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPostBySlug((await params).slug);
  if (!post) notFound();

  return (
    <BlogPageShell>
      <BlogPostContent post={post} />
    </BlogPageShell>
  );
}
