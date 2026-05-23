import { Metadata } from 'next';
import ToursContent from '@/components/ToursPage';

export const metadata: Metadata = {
  title: 'Tours in Oaxaca | Guided City Tours & Hiking | Oaxaca Rental',
  description: 'Discover Oaxaca with guided city tours and hiking adventures. Bilingual guides, authentic experiences, and local restaurants.',
  openGraph: {
    title: 'Tours in Oaxaca | Guided City Tours & Hiking | Oaxaca Rental',
    description: 'Discover Oaxaca with guided city tours and hiking adventures. Bilingual guides, authentic experiences, and local restaurants.',
    type: 'website',
  },
};

export default function ToursPage() {
  return <ToursContent />;
}
