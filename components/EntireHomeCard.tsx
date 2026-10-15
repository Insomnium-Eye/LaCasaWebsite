'use client';

import { Unit } from '../data/units';
import { useLanguage } from '../contexts/LanguageContext';
import useUsdToMxn from '../hooks/useUsdToMxn';

interface Props {
  unit: Unit;
  onInquire: () => void;
}

export default function EntireHomeCard({ unit, onInquire }: Props) {
  const { t, language } = useLanguage();
  const es = language === 'es';
  const { rate } = useUsdToMxn();
  const usd = rate > 0 ? Math.floor(unit.monthlyRateMXN / rate) : null;

  return (
    <article
      onClick={onInquire}
      className="group cursor-pointer overflow-hidden rounded-4xl border border-amber-700/50 bg-[#241a13]/90 shadow-sm shadow-black/10 transition hover:-translate-y-1 hover:shadow-lg md:grid md:grid-cols-5"
    >
      <div className="h-56 overflow-hidden md:col-span-2 md:h-full">
        {unit.displayImage && (
          <img
            src={unit.displayImage}
            alt={t(`units.items.${unit.slug}.name`)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <div className="space-y-5 p-6 md:col-span-3 md:p-8">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {t(`units.items.${unit.slug}.type`)}
            </p>
            <span className="rounded-full border border-amber-500/60 bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-300">
              {t('units.entireHome.leaseBadge')}
            </span>
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-slate-100">
            {t(`units.items.${unit.slug}.name`)}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {t(`units.items.${unit.slug}.summary`)}
          </p>
        </div>

        <div>
          <p className="text-3xl font-semibold text-white">
            ${unit.monthlyRateMXN.toLocaleString(es ? 'es-MX' : 'en-US')}
            <span className="text-base font-normal text-slate-400"> MXN{t('units.entireHome.perMonth')}</span>
          </p>
          {!es && (
            <p className="mt-1 text-sm text-slate-400">
              ≈ ${usd !== null ? usd.toLocaleString('en-US') : '—'} USD{t('units.entireHome.perMonth')}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-amber-900/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
          {t('units.entireHome.leaseNote')}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onInquire(); }}
            className="rounded-full bg-terracotta px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#b55e47]"
          >
            {t('units.entireHome.inquire')}
          </button>
        </div>
      </div>
    </article>
  );
}
