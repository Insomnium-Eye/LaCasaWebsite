import React, { useState } from 'react';

interface IdVerificationProps {
  onVerificationComplete?: (verified: boolean) => void;
  onStatusChange?: (status: 'pending' | 'in-progress' | 'verified' | 'failed') => void;
}

type VerificationStep = 'idle' | 'upload' | 'selfie' | 'processing' | 'success' | 'error';

/**
 * IdVerification Component
 * 
 * Handles ID verification flow for booking:
 * 1. Upload government ID (photo/scan)
 * 2. Take selfie for liveness check
 * 3. Submit for processing
 * 4. Display verification status
 * 
 * In production, integrate with Veriff, Persona, or Signzy API.
 * This is a demo with placeholder API structure for Veriff.
 * 
 * Note: To use real verification:
 * - Sign up with service provider
 * - Get API key and session token
 * - Replace mock functions with actual API calls
 * - Add verification iframe/SDK
 */
const IdVerification: React.FC<IdVerificationProps> = ({
  onVerificationComplete,
  onStatusChange,
}) => {
  const [step, setStep] = useState<VerificationStep>('idle');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  // Reset verification attempt
  const handleReset = () => {
    setStep('idle');
    setIdFile(null);
    setSelfieFile(null);
    setError(null);
    setVerificationId(null);
    onStatusChange?.('pending');
  };

  // Handle ID file upload
  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
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
    setStep('selfie');
  };

  // Handle selfie upload
  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10 MB');
      return;
    }

    setSelfieFile(file);
    setError(null);
  };

  // Submit verification (mock API call)
  const handleSubmitVerification = async () => {
    if (!idFile || !selfieFile) {
      setError('Please upload both ID and selfie before submitting');
      return;
    }

    try {
      setStep('processing');
      onStatusChange?.('in-progress');
      setError(null);

      // Create form data
      const formData = new FormData();
      formData.append('idDocument', idFile);
      formData.append('selfie', selfieFile);
      formData.append('timestamp', new Date().toISOString());

      // Mock API call to verification service (Veriff example)
      // In production, use actual Veriff SDK:
      // const verificationSession = await fetch('/.netlify/functions/start-verification', {
      //   method: 'POST',
      //   body: formData,
      // })

      // For demo, simulate API delay and success
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock success response
      const mockVerificationId = `VERIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setVerificationId(mockVerificationId);

      // Simulate verification processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock success (90% success rate for demo)
      const isSuccessful = Math.random() < 0.9;

      if (isSuccessful) {
        setStep('success');
        onStatusChange?.('verified');
        onVerificationComplete?.(true);
      } else {
        setStep('error');
        setError('Verification failed. Please ensure your ID is clear and your face matches.');
        onStatusChange?.('failed');
        onVerificationComplete?.(false);
      }
    } catch (err) {
      setStep('error');
      setError(err instanceof Error ? err.message : 'Verification service error');
      onStatusChange?.('failed');
      onVerificationComplete?.(false);
    }
  };

  return (
    <section className="py-8 px-4 md:px-8 bg-gradient-to-b from-blue-50 via-cyan-50 to-white rounded-lg border border-blue-200">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-2">
          <span>🆔</span> ID Verification
        </h2>
        <p className="text-blue-800">
          For your security and ours, we verify guest identity. This takes about 2 minutes.
        </p>
      </div>

      {/* Idle State - Start Verification */}
      {step === 'idle' && (
        <div className="max-w-2xl">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">What to prepare:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>✓ Valid government-issued ID (passport, driver's license, etc.)</li>
              <li>✓ Clear photo/scan of both sides if applicable</li>
              <li>✓ Good lighting for selfie verification</li>
              <li>✓ 5 minutes of your time</li>
            </ul>
          </div>

          <button
            onClick={() => {
              setStep('upload');
              onStatusChange?.('in-progress');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Start ID Verification
          </button>
        </div>
      )}

      {/* Upload State */}
      {step === 'upload' && (
        <div className="max-w-2xl space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="text-sm font-semibold text-green-700">ID Document</span>
            </div>
            <div className="flex-1 h-1 bg-blue-200 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-300 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="text-sm font-semibold text-blue-700">Selfie</span>
            </div>
          </div>

          {/* ID Upload */}
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-3">
              Step 1: Upload Your ID Document
            </label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                id="id-upload"
                accept="image/*"
                onChange={handleIdUpload}
                className="hidden"
              />
              <label
                htmlFor="id-upload"
                className="cursor-pointer block"
              >
                <div className="text-3xl mb-2">📸</div>
                <p className="text-blue-900 font-semibold mb-1">
                  {idFile ? '✓ ' + idFile.name : 'Click to upload ID'}
                </p>
                <p className="text-xs text-blue-700">
                  JPG, PNG • Max 10MB • Both sides if needed
                </p>
              </label>
            </div>
          </div>

          {/* Selfie Upload */}
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-3">
              Step 2: Take a Selfie
            </label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                id="selfie-upload"
                accept="image/*"
                onChange={handleSelfieUpload}
                className="hidden"
              />
              <label
                htmlFor="selfie-upload"
                className="cursor-pointer block"
              >
                <div className="text-3xl mb-2">🤳</div>
                <p className="text-blue-900 font-semibold mb-1">
                  {selfieFile ? '✓ ' + selfieFile.name : 'Click to upload selfie'}
                </p>
                <p className="text-xs text-blue-700">
                  JPG, PNG • Max 10MB • Clear, well-lit photo
                </p>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmitVerification}
              disabled={!idFile || !selfieFile}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {!idFile || !selfieFile ? 'Upload Both Files' : 'Submit for Verification'}
            </button>
          </div>
        </div>
      )}

      {/* Processing State */}
      {step === 'processing' && (
        <div className="max-w-2xl text-center py-8">
          <div className="animate-spin inline-block">
            <div className="text-5xl mb-4">⏳</div>
          </div>
          <h3 className="text-2xl font-bold text-blue-900 mb-2">Verifying Your Identity</h3>
          <p className="text-blue-800 mb-2">This usually takes less than a minute...</p>
          {verificationId && (
            <p className="text-xs text-blue-600">
              Verification ID: {verificationId}
            </p>
          )}
          <div className="mt-6 w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full animate-pulse"
              style={{ width: '60%' }}
            ></div>
          </div>
        </div>
      )}

      {/* Success State */}
      {step === 'success' && (
        <div className="max-w-2xl text-center py-8">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">Verification Successful!</h3>
          <p className="text-green-800 mb-6">
            Your identity has been verified. You can now complete your booking.
          </p>
          <div className="bg-green-100 border border-green-400 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              <strong>Verification ID:</strong> {verificationId}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Continue to Booking
          </button>
        </div>
      )}

      {/* Error State */}
      {step === 'error' && (
        <div className="max-w-2xl text-center py-8">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-red-900 mb-2">Verification Failed</h3>
          <p className="text-red-800 mb-6">{error}</p>
          <div className="bg-amber-100 border border-amber-400 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Tips:</strong> Ensure your ID document is clear, well-lit, and completely visible.
              Your selfie should match your ID and be taken in good lighting.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Info Box */}
      {(step === 'idle' || step === 'upload') && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">🔒 Your Privacy & Security</p>
          <p className="text-xs">
            Your documents are processed securely with industry-leading verification partners.
            We encrypt all data and never share your information with third parties beyond our
            verification provider. After verification, your documents are deleted from our systems.
          </p>
        </div>
      )}
    </section>
  );
};

export default IdVerification;
