'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import useUsdToMxn from '@/hooks/useUsdToMxn';
import useNightlyRates from '@/hooks/useNightlyRates';
import { oaxacaToday } from '@/lib/date';
import { formatNightlyPrice } from '@/lib/nightlyRates';

/**
 * A unit's current nightly price (live from Hospitable), with a note saying
 * whether it's tonight's price or the next available night's.
 */
export default function NightlyPrice({ slug, tone = 'dark' }: { slug: string; tone?: 'dark' | 'light' }) {
  const { language } = useLanguage();
  const es = language === 'es';
  const { rate } = useUsdToMxn();
  const rates = useNightlyRates(slug);
  const nightly = rates && formatNightlyPrice(rates, language, rate);

  const priceClass = tone === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedClass = tone === 'dark' ? 'text-slate-400' : 'text-slate-500';

  if (!nightly) return <p className={`text-sm ${mutedClass}`}>…</p>;

  let note: string;
  if (!nightly.live) {
    note = es ? 'Tarifa nocturna según demanda.' : 'Nightly rate varies by demand.';
  } else if (nightly.date === oaxacaToday()) {
    note = es ? 'Precio de esta noche' : "Tonight's price";
  } else {
    const day = new Date(nightly.date + 'T12:00:00Z').toLocaleDateString(es ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    note = es ? `Próxima noche disponible: ${day}` : `Next available night: ${day}`;
  }

  return (
    <div>
      <p className={`text-lg font-semibold ${priceClass}`}>
        {nightly.price}
        <span className={`text-sm font-normal ${mutedClass}`}> {nightly.unit}</span>
      </p>
      <p className={`text-xs ${mutedClass}`}>{note}</p>
    </div>
  );
}
