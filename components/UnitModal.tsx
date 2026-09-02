'use client';

import { useEffect, useState } from 'react';
import { Unit, LEASE_TIERS } from '../data/units';
import { useLanguage } from '../contexts/LanguageContext';
import useUsdToMxn from '../hooks/useUsdToMxn';
import useAvailability, { Availability } from '../hooks/useAvailability';
import LeaseApplicationModal from './LeaseApplicationModal';

interface UnitModalProps {
  unit: Unit | null;
  onClose: () => void;
}

export default function UnitModal({ unit, onClose }: UnitModalProps) {
  const { t, language } = useLanguage();
  const es = language === 'es';
  const { rate } = useUsdToMxn();
  const { availability, loading: availLoading } = useAvailability(unit?.slug ?? '');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!unit) return null;

  const allImages = unit.displayImage ? [unit.displayImage, ...(unit.galleryImages || [])] : (unit.galleryImages || []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t(`units.items.${unit.slug}.type`)}</p>
              <h2 className="mt-1 text-3xl font-semibold text-slate-900">{t(`units.items.${unit.slug}.name`)}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Primary Image */}
          {unit.displayImage && (
            <div className="mb-6">
              <img 
                src={unit.displayImage} 
                alt={unit.name} 
                className="w-full h-64 object-cover rounded-xl cursor-pointer"
                onClick={() => setSelectedImage(unit.displayImage!)}
              />
            </div>
          )}

          {/* Gallery */}
          {allImages.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{t('unitModal.galleryTitle')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allImages.slice(1).map((image, index) => (
                  <img 
                    key={index} 
                    src={image} 
                    alt={`${unit.name} ${index + 2}`} 
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedImage(image)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <p className="text-slate-600 text-lg leading-relaxed">{t(`units.items.${unit.slug}.summary`)}</p>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">{t("home.modal.capacity")}</span>
              <span className="text-slate-600">{unit.capacity} {t("home.modal.guests")}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">{t("home.modal.bathroom")}</span>
              <span className="text-slate-600">{t(`units.items.${unit.slug}.bathroom`)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">{t("home.modal.terrace")}</span>
              <span className="text-slate-600">{t(`units.items.${unit.slug}.terrace`)}</span>
            </div>
          </div>

          {/* Rental Options */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            {/* Short-term */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Short-term · Airbnb</p>
                {availLoading
                  ? <span className="text-xs text-slate-400">—</span>
                  : availability?.nightly
                    ? <span className={`flex items-center gap-1 text-xs font-semibold ${/now/i.test(availability.nightly) ? 'text-green-600' : 'text-amber-600'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${/now/i.test(availability.nightly) ? 'bg-green-500' : 'bg-amber-500'}`} />
                        {availability.nightly}
                      </span>
                    : null
                }
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-semibold text-slate-900">
                  {es && rate > 0
                    ? <>${Math.round(unit.shortTermMin * rate).toLocaleString()}–${Math.round(unit.shortTermMax * rate).toLocaleString()}<span className="text-sm font-normal text-slate-500"> MXN/noche</span></>
                    : <>${unit.shortTermMin}–${unit.shortTermMax}<span className="text-sm font-normal text-slate-500"> USD/night</span></>
                  }
                </p>
                <a
                  href={unit.airbnbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-terracotta hover:text-[#b55e47] transition"
                >
                  Book on Airbnb ↗
                </a>
              </div>
              <p className="mt-1 text-xs text-slate-400">Nightly rate based on demand, before discounts.</p>
            </div>

            {/* Monthly lease — tiered */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 mb-3">Monthly lease</p>

              {/* Tier table */}
              <div className="space-y-2">
                {LEASE_TIERS.map((tier) => {
                  const mxn = Math.round(unit.monthlyRateMXN * tier.multiplier);
                  const usd = rate > 0 ? Math.floor(mxn / rate).toLocaleString() : '—';
                  const isAnnual = tier.multiplier === 1;
                  const tierAvail = availability?.[tier.availKey as keyof Availability] ?? null;
                  const isNow = tierAvail ? /now/i.test(tierAvail) : false;
                  return (
                    <div
                      key={tier.label}
                      className={`text-sm ${isAnnual ? 'pt-2 border-t border-amber-200 font-semibold' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-24 shrink-0 text-xs ${isAnnual ? 'text-amber-800' : 'text-slate-500'}`}>
                          {tier.label}
                        </span>
                        <span className={`flex-1 ${isAnnual ? 'text-slate-900' : 'text-slate-700'}`}>
                          {es
                            ? <>${mxn.toLocaleString()} <span className={`text-xs font-normal ${isAnnual ? 'text-slate-500' : 'text-slate-400'}`}>MXN/mo</span></>
                            : <>${usd} <span className={`text-xs font-normal ${isAnnual ? 'text-slate-500' : 'text-slate-400'}`}>USD/mo</span></>
                          }
                        </span>
                        <span className={`shrink-0 text-xs font-semibold ${isAnnual ? 'text-amber-600' : 'text-slate-400'}`}>
                          {tier.badge}
                        </span>
                      </div>
                      {!availLoading && tierAvail && (
                        <div className="pl-24 mt-0.5">
                          <span className={`flex items-center gap-1 text-xs font-semibold ${isNow ? 'text-green-600' : 'text-amber-600'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isNow ? 'bg-green-500' : 'bg-amber-500'}`} />
                            {tierAvail}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-amber-200 space-y-0.5 text-xs text-slate-500">
                <p>Deposit upon approval: 1 month + ½ = <span className="font-semibold text-slate-700">${Math.round(unit.monthlyRateMXN * 1.5).toLocaleString()} MXN</span></p>
                <p>Rent due the <span className="font-semibold text-slate-700">1st of every month</span></p>
              </div>
            </div>

            <button
              onClick={() => setShowApply(true)}
              className="block w-full rounded-full bg-terracotta px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#b55e47]"
            >
              {t('unitModal.bookNow')}
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-[90vh] p-4">
            <img 
              src={selectedImage} 
              alt="Gallery image" 
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 rounded-full p-2 text-white bg-black/50 hover:bg-black/70"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showApply && (
        <LeaseApplicationModal unit={unit} onClose={() => setShowApply(false)} />
      )}
    </div>
  );
}