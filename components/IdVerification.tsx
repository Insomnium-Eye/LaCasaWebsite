import React, { useState } from 'react';

interface IdVerificationProps {
  onVerificationComplete?: (verified: boolean) => void;
  onStatusChange?: (status: 'pending' | 'in-progress' | 'verified' | 'failed') => void;
}

type VerificationStep = 'idle' | 'upload' | 'processing' | 'success' | 'error';

const IdVerification: React.FC<IdVerificationProps> = ({
  onVerificationComplete,
  onStatusChange,
}) => {
  const [step, setStep] = useState<VerificationStep>('idle');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setStep('idle');
    setIdFile(null);
    setError(null);
    onStatusChange?.('pending');
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10 MB');
      return;
    }

    setIdFile(file);
    setError(null);
    setStep('processing');
    onStatusChange?.('in-progress');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const imageBase64 = (reader.result as string).split(',')[1];
        const res = await fetch('/api/verify/document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64, mimeType: file.type }),
        });
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error ?? 'Verification service unavailable');
        }

        if (data.isIdentityDocument) {
          setStep('success');
          onStatusChange?.('verified');
          onVerificationComplete?.(true);
        } else {
          setError('The uploaded image does not appear to be a valid government ID or passport. Please upload a clear photo of your ID.');
          setStep('error');
          onStatusChange?.('failed');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Verification failed';
        setError(msg);
        setStep('error');
        onStatusChange?.('failed');
      }
    };
    reader.onerror = () => {
      setError('Could not read the file. Please try again.');
      setStep('error');
      onStatusChange?.('failed');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">ID Verification Required</h2>
        <p className="text-gray-600 mb-6">
          Your ID is required to verify age (18+) and for security purposes as part of our background check process. IDs are not stored on our servers and are used only for one-time verification through secure third-party APIs. This is a mandatory requirement to complete any booking.
        </p>

        {step === 'idle' && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Upload Your Government ID
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleIdUpload}
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your ID...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-gray-600 mb-4">ID verification successful!</p>
            <button
              onClick={() => onVerificationComplete?.(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mr-2"
            >
              Try Again
            </button>
            <button
              onClick={() => onVerificationComplete?.(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        )}

        {error && step !== 'error' && (
          <p className="text-red-600 mt-4">{error}</p>
        )}
      </div>
    </div>
  );
};

export default IdVerification;
