import { Metadata } from 'next';
import TransportationServices from '@/components/TransportationServices';

export const metadata: Metadata = {
  title: 'Private Driving Services | La Casa Oaxaca',
  description: 'Reliable round-trip private transfers to Oaxaca\'s most popular destinations. Airport, Monte Albán, Hierve el Agua, and more.',
  openGraph: {
    title: 'Private Driving Services | La Casa Oaxaca',
    description: 'Reliable round-trip private transfers to Oaxaca\'s most popular destinations.',
    type: 'website',
  },
};

export default function TransportationPage() {
  return (
    <div className="min-h-screen bg-white">
      <TransportationServices />
    </div>
  );
}
