'use client';

import { useState, useRef } from 'react';
import { GuestSession } from '@/types/guest-portal';
import { useLanguage } from '@/contexts/LanguageContext';

interface IDVerificationFormProps {
  session: GuestSession | null;
}

type StepStatus = 'idle' | 'loading' | 'pass' | 'fail' | 'warning' | 'alert';

interface DocumentResult {
  isIdentityDocument: boolean;
  documentType: string | null;
  confidence: number;
  error?: string;
}

interface SanctionsResult {
  alertLevel: 'clear' | 'warning' | 'alert';
  matches: Array<{ listedName: string; similarity: number }>;
  totalEntriesChecked: number;
  error?: string;
}

const StatusBadge = ({ status, label }: { status: StepStatus; label: string }) => {
  const styles: Record<StepStatus, string> = {
    idle:    'bg-gray-100 text-gray-500',
    loading: 'bg-amber-50 text-amber-700 animate-pulse',
    pass:    'bg-green-50 text-green-700 border border-green-200',
    fail:    'bg-red-50 text-red-700 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    alert:   'bg-red-50 text-red-800 border border-red-300',
  };
  const icons: Record<StepStatus, string> = {
    idle: '○', loading: '…', pass: '✓', fail: '✗', warning: '⚠', alert: '🚨',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {icons[status]} {label}
    </span>
  );
};

export default function IDVerificationForm({ session }: IDVerificationFormProps) {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');

  const [docStatus, setDocStatus] = useState<StepStatus>('idle');
  const [docResult, setDocResult] = useState<DocumentResult | null>(null);

  const [sanctionsStatus, setSanctionsStatus] = useState<StepStatus>('idle');
  const [sanctionsResult, setSanctionsResult] = useState<SanctionsResult | null>(null);

  const [globalError, setGlobalError] = useState<string | null>(null);

  if (!session) return null;

  const guestFullName = session.guestName;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    setPreviewUrl(URL.createObjectURL(file));
    setDocStatus('idle');
    setDocResult(null);
    setSanctionsStatus('idle');
    setSanctionsResult(null);
    setGlobalError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageBase64(result); // keep data-URL; the API route strips the prefix
    };
    reader.readAsDataURL(file);
  };

  const handleVerify = async () => {
    if (!imageBase64) return;
    setGlobalError(null);

    // ── Step 1: Document check ────────────────────────────────────────────────
    setDocStatus('loading');
    try {
      const docRes = await fetch('/api/verify/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ imageBase64, mimeType }),
      });
      const doc: DocumentResult = await docRes.json();

      if (doc.error?.includes('not configured')) {
        setDocStatus('warning');
        setDocResult(doc);
      } else if (!docRes.ok || !doc.isIdentityDocument) {
        setDocStatus('fail');
        setDocResult(doc);
      } else {
        setDocStatus('pass');
        setDocResult(doc);
      }
    } catch {
      setDocStatus('fail');
      setGlobalError(language === 'es' ? 'Error al verificar el documento.' : 'Document verification failed.');
      return;
    }

    // ── Step 2: Sanctions check ───────────────────────────────────────────────
    setSanctionsStatus('loading');
    try {
      const sRes = await fetch('/api/verify/sanctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ name: guestFullName }),
      });
      const sanctions: SanctionsResult = await sRes.json();

      if (!sRes.ok) {
        setSanctionsStatus('fail');
        setSanctionsResult(sanctions);
      } else {
        setSanctionsStatus(
          sanctions.alertLevel === 'alert' ? 'alert' :
          sanctions.alertLevel === 'warning' ? 'warning' :
          'pass',
        );
        setSanctionsResult(sanctions);
      }
    } catch {
      setSanctionsStatus('fail');
    }
  };

  const isRunning = docStatus === 'loading' || sanctionsStatus === 'loading';
  const canVerify = !!imageBase64 && !isRunning;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          {t('portal.idVerification.title')}
        </h3>
        <p className="text-gray-600 text-sm">{t('portal.idVerification.description')}</p>
      </div>

      {/* Guest name */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {t('portal.idVerification.guestName')}
        </p>
        <p className="text-lg font-semibold text-gray-900">{guestFullName}</p>
      </div>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('portal.idVerification.uploadLabel')} <span className="text-red-500">*</span>
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500 transition-colors"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="ID preview" className="mx-auto max-h-48 rounded object-contain" />
          ) : (
            <div className="text-gray-400 space-y-1">
              <p className="text-3xl">🪪</p>
              <p className="text-sm">{t('portal.idVerification.uploadPlaceholder')}</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={!canVerify}
        className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
      >
        {isRunning ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{t('portal.idVerification.verifying')}</span>
          </div>
        ) : (
          t('portal.idVerification.verifyButton')
        )}
      </button>

      {/* Results */}
      {(docStatus !== 'idle' || sanctionsStatus !== 'idle') && (
        <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {/* Document result */}
          {docStatus !== 'idle' && (
            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  {t('portal.idVerification.documentCheck')}
                </span>
                <StatusBadge
                  status={docStatus}
                  label={
                    docStatus === 'pass' ? t('portal.idVerification.documentValid') :
                    docStatus === 'warning' ? t('portal.idVerification.setupRequired') :
                    docStatus === 'loading' ? '…' :
                    t('portal.idVerification.documentInvalid')
                  }
                />
              </div>
              {docResult?.documentType && (
                <p className="text-xs text-gray-500">
                  {language === 'es' ? 'Tipo detectado' : 'Detected type'}: {docResult.documentType}
                </p>
              )}
              {docResult?.error && (
                <p className="text-xs text-amber-700">{docResult.error}</p>
              )}
            </div>
          )}

          {/* Sanctions result */}
          {sanctionsStatus !== 'idle' && (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  {t('portal.idVerification.sanctionsCheck')}
                </span>
                <StatusBadge
                  status={sanctionsStatus}
                  label={
                    sanctionsStatus === 'pass' ? t('portal.idVerification.clear') :
                    sanctionsStatus === 'warning' ? t('portal.idVerification.warningMatch') :
                    sanctionsStatus === 'alert' ? t('portal.idVerification.alertMatch') :
                    sanctionsStatus === 'loading' ? '…' :
                    t('portal.idVerification.checkFailed')
                  }
                />
              </div>

              {sanctionsResult && sanctionsStatus !== 'loading' && (
                <>
                  {sanctionsResult.matches.length > 0 ? (
                    <div className="space-y-1">
                      {sanctionsResult.matches.map((m, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-600">
                          <span className="font-mono">{m.listedName}</span>
                          <span className="text-gray-400 ml-2">
                            {(m.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {t('portal.idVerification.noMatches')} ({sanctionsResult.totalEntriesChecked.toLocaleString()} {language === 'es' ? 'entradas verificadas' : 'entries checked'})
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {globalError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-700">{globalError}</p>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 leading-relaxed">
        {t('portal.idVerification.disclaimer')}
      </p>
    </div>
  );
}
