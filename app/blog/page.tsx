import { Metadata } from 'next';
import BlogPageShell from '@/components/blog/BlogPageShell';
import BlogIndex from '@/components/blog/BlogIndex';

export const metadata: Metadata = {
  title: 'Blog | La Casa Oaxaca',
  description: 'Weekly stories, walks and quiet places around Oaxaca, with original photos, from La Casa Oaxaca in San Felipe del Agua.',
  openGraph: {
    title: 'Blog | La Casa Oaxaca',
    description: 'Weekly stories, walks and quiet places around Oaxaca, with original photos.',
    type: 'website',
  },
};

export default function BlogPage() {
  return (
    <BlogPageShell wide>
      <BlogIndex />
    </BlogPageShell>
  );
}
