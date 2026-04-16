'use client';

import { useEffect, useState } from 'react';
import { Unit } from '../data/units';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPrice } from '../lib/currency';
import BookingModal from './BookingModal';

interface UnitModalProps {
  unit: Unit | null;
  onClose: () => void;
}

export default function UnitModal({ unit, onClose }: UnitModalProps) {
  const { t, language } = useLanguage();
  const [showBooking, setShowBooking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

          {/* Price and Book Button */}
          <div className="pt-4 border-t border-slate-200">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-900">{t('unitModal.nightlyRate')}</span>
                <span className="text-lg font-semibold text-slate-900">{formatPrice(unit.nightlyRate, language)}/{t('book.priceUnit.night')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-900">{t('unitModal.weeklyRate')}</span>
                <span className="text-lg font-semibold text-slate-900">{formatPrice(unit.weeklyRate, language)}/{t('book.priceUnit.week')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-900">{t('unitModal.monthlyRate')}</span>
                <span className="text-lg font-semibold text-slate-900">{formatPrice(unit.monthlyRate, language)}/{t('book.priceUnit.month')}</span>
              </div>
            </div>
            <button
              onClick={() => setShowBooking(true)}
              className="w-full rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47]"
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

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal 
          unit={unit} 
          onClose={() => setShowBooking(false)} 
          onBackToUnit={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}