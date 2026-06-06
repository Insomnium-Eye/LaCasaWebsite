'use client';

import { useState, useRef } from 'react';
import { GuestSession } from '@/types/guest-portal';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  session: GuestSession | null;
}

const CATEGORIES_EN = [
  'Bathroom / Plumbing',
  'Appliances',
  'Internet / Wi-Fi',
  'Electricity / Lighting',
  'Air Conditioning / Heating',
  'Locks / Door',
  'Furniture / Fixtures',
  'Other',
];

const CATEGORIES_ES = [
  'Baño / Plomería',
  'Electrodomésticos',
  'Internet / Wi-Fi',
  'Electricidad / Iluminación',
  'Aire acondicionado / Calefacción',
  'Cerraduras / Puerta',
  'Muebles / Accesorios',
  'Otro',
];

export default function MaintenanceRequestForm({ session }: Props) {
  const { language } = useLanguage();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!session) return null;

  const categories = language === 'es' ? CATEGORIES_ES : CATEGORIES_EN;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(language === 'es' ? 'La imagen debe ser menor a 5 MB.' : 'Image must be under 5 MB.');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setError(null);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !description.trim()) return;
    setLoading(true);
    setError(null);

    try {
      let imageBase64: string | null = null;
      let imageName: string | null = null;
      let imageMime: string | null = null;

      if (imageFile && imagePreview) {
        // Strip the data URL prefix to get raw base64
        imageBase64 = imagePreview.split(',')[1];
        imageName = imageFile.name;
        imageMime = imageFile.type;
      }

      const res = await fetch('/api/requests/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session!.token}`,
        },
        body: JSON.stringify({ category, description, imageBase64, imageName, imageMime }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (language === 'es' ? 'Error al enviar. Intenta de nuevo.' : 'Failed to submit. Please try again.'));
        return;
      }

      setSuccess(true);
      setCategory('');
      setDescription('');
      removeImage();
      setTimeout(() => setSuccess(false), 6000);
    } catch {
      setError(language === 'es' ? 'Error de red. Intenta de nuevo.' : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const label = (en: string, es: string) => language === 'es' ? es : en;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {label('Maintenance Request', 'Solicitud de Mantenimiento')}
      </h3>
      <p className="text-gray-500 text-sm mb-6">
        {label(
          'Report any issue with your unit and we\'ll address it as soon as possible.',
          'Reporta cualquier problema con tu unidad y lo atenderemos a la brevedad.',
        )}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label('Category', 'Categoría')} <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-amber-600"
          >
            <option value="">{label('Select a category…', 'Selecciona una categoría…')}</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label('Description', 'Descripción')} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            placeholder={label(
              'Describe the issue in as much detail as possible…',
              'Describe el problema con el mayor detalle posible…',
            )}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-amber-600 resize-none"
          />
        </div>

        {/* Photo upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label('Photo (optional)', 'Foto (opcional)')}
          </label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="preview"
                className="h-40 rounded-lg object-cover border border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-500 transition">
              <span className="text-2xl mb-1">📷</span>
              <span className="text-sm text-gray-500">
                {label('Click to upload a photo', 'Haz clic para subir una foto')}
              </span>
              <span className="text-xs text-gray-400">{label('Max 5 MB', 'Máximo 5 MB')}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-700">
            ✓ {label('Request submitted. We\'ll look into it shortly.', 'Solicitud enviada. Lo revisaremos a la brevedad.')}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !category || !description.trim()}
          className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {label('Submitting…', 'Enviando…')}
            </span>
          ) : label('Submit Request', 'Enviar Solicitud')}
        </button>
      </form>
    </div>
  );
}
