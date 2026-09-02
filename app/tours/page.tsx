import { Metadata } from 'next';
import ToursContent from '@/components/ToursPage';

export const metadata: Metadata = {
  title: 'Private Rides & Transfers | Oaxaca to Puerto Escondido | La Casa Oaxaca',
  description: 'Private door-to-door transportation from Oaxaca to Puerto Escondido, Huatulco & beyond in a Honda HR-V (up to 6 passengers). 2-night beach escape packages available.',
  openGraph: {
    title: 'Private Rides & Transfers | La Casa Oaxaca',
    description: 'Private door-to-door transfers from Oaxaca to Puerto Escondido, Huatulco & beyond. Up to 6 passengers. 2-night beach packages.',
    type: 'website',
  },
};

export default function ToursPage() {
  return <ToursContent />;
}
