'use client';

import Link from 'next/link';
import { Unit, LEASE_TIERS } from '../data/units';
import { useLanguage } from '../contexts/LanguageContext';
import useAvailability from '../hooks/useAvailability';
import useUsdToMxn from '../hooks/useUsdToMxn';

interface Props {
  unit: Unit;
  onSelect: () => void;
  onInquire: (e: React.MouseEvent) => void;
  showDetails?: boolean;
}

function AvailBadge({ label }: { label: string | null }) {
  if (!label) return <span className="text-xs text-slate-500">—</span>;
  const isNow = /now/i.test(label);
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${isNow ? 'text-green-300' : 'text-amber-300'}`}>
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isNow ? 'bg-green-400' : 'bg-amber-400'}`} />
      {label}
    </span>
  );
}

export default function UnitCard({ unit, onSelect, onInquire, showDetails }: Props) {
  const { t } = useLanguage();
  const { rate } = useUsdToMxn();
  const { availability, loading } = useAvailability(unit.slug);

  return (
    <article
      onClick={onSelect}
      className="group cursor-pointer rounded-4xl border border-slate-700 bg-[#241a13]/90 shadow-sm shadow-black/10 transition hover:-translate-y-1 hover:shadow-lg overflow-hidden"
    >
      {/* Image */}
      <div className={`overflow-hidden ${showDetails ? 'h-56' : 'h-48'}`}>
        {unit.displayImage ? (
          <img
            src={unit.displayImage}
            alt={t(`units.items.${unit.slug}.name`)}
            className="h-full w-full object-cover transition group-hover:scale-105 duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-800 text-slate-400">No image</div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {t(`units.items.${unit.slug}.type`)}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-100">
            {t(`units.items.${unit.slug}.name`)}
          </h3>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {t(`units.items.${unit.slug}.summary`)}
          </p>
        </div>

        {showDetails && (
          <ul className="space-y-1 text-slate-400 text-sm">
            <li>{t('units.capacityLabel')} {unit.capacity} {t('units.guestsLabel')}</li>
            <li>{t(`units.items.${unit.slug}.bathroom`)}</li>
            <li>{t(`units.items.${unit.slug}.terrace`)}</li>
          </ul>
        )}

        {/* Short-term */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Short-term · Airbnb</p>
            {loading
              ? <span className="text-xs text-slate-600">loading…</span>
              : <AvailBadge label={availability?.shortTerm ?? null} />
            }
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">
              ${unit.shortTermMin}–${unit.shortTermMax}
              <span className="font-normal text-slate-400"> USD/night</span>
            </p>
            <Link
              href={unit.airbnbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-terracotta hover:text-[#b55e47] shrink-0 transition"
              onClick={(e) => e.stopPropagation()}
            >
              View on Airbnb ↗
            </Link>
          </div>
          <p className="text-xs text-slate-500">Nightly rate varies by demand, before discounts.</p>
        </div>

        {/* Monthly lease — tiered */}
        <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 px-4 py-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-400/80">Monthly lease</p>
            {loading
              ? <span className="text-xs text-slate-600">loading…</span>
              : <AvailBadge label={availability?.longTerm ?? null} />
            }
          </div>

          <div className="space-y-1.5">
            {LEASE_TIERS.map((tier) => {
              const mxn = Math.round(unit.monthlyRateMXN * tier.multiplier);
              const isAnnual = tier.multiplier === 1;
              return (
                <div
                  key={tier.label}
                  className={`flex items-center gap-2 text-xs ${isAnnual ? 'pt-1.5 border-t border-amber-900/40' : ''}`}
                >
                  <span className={`w-20 shrink-0 ${isAnnual ? 'text-amber-200 font-semibold' : 'text-slate-400'}`}>
                    {tier.label}
                  </span>
                  <span className={`flex-1 font-semibold ${isAnnual ? 'text-white' : 'text-slate-300'}`}>
                    ${mxn.toLocaleString()} <span className="font-normal text-slate-500">MXN/mo</span>
                  </span>
                  <span className={`shrink-0 font-semibold ${isAnnual ? 'text-amber-300' : 'text-slate-500'}`}>
                    {tier.badge}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <p className="text-xs text-slate-500">Base = 12-month annual rate</p>
            <button
              className="rounded-full bg-terracotta px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#b55e47] shrink-0"
              onClick={onInquire}
            >
              Inquire
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
