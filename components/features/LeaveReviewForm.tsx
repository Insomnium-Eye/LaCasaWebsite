import { useState } from 'react';
import { GuestSession } from '@/types/guest-portal';

interface LeaveReviewFormProps {
  session: GuestSession | null;
}

const LeaveReviewForm = ({ session }: LeaveReviewFormProps) => {
  const [stars, setStars] = useState(0);
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Only JPEG, PNG, and WEBP images are allowed');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be smaller than 5 MB');
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        newPreviews.push(event.target?.result as string);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    setImages((prev) => [...prev, ...validFiles]);
    setError(null);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate inputs
      if (!stars) {
        setError('Please select a star rating');
        setLoading(false);
        return;
      }

      if (!headline.trim()) {
        setError('Headline is required');
        setLoading(false);
        return;
      }

      if (!body.trim()) {
        setError('Review text is required');
        setLoading(false);
        return;
      }

      // Build FormData
      const formData = new FormData();
      formData.append('stars', stars.toString());
      formData.append('headline', headline);
      formData.append('body', body);
      formData.append('anonymous', anonymous.toString());

      for (const image of images) {
        formData.append('images', image);
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit review');
        return;
      }

      setSuccess(true);
      setStars(0);
      setHeadline('');
      setBody('');
      setAnonymous(false);
      setImages([]);
      setImagePreviews([]);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">⭐ Leave a Review</h3>
      <p className="text-gray-600 mb-6">
        Share your experience! Your review helps other guests and guides us to improve.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How would you rate your stay? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setStars(rating)}
                className="text-4xl transition-transform hover:scale-110"
              >
                <span className={stars >= rating ? '⭐' : '☆'}>
                  {stars >= rating ? '⭐' : '☆'}
                </span>
              </button>
            ))}
          </div>
          {stars > 0 && <p className="text-sm text-gray-600 mt-2">{stars} out of 5 stars</p>}
        </div>

        {/* Headline */}
        <div>
          <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
            Review Headline <span className="text-red-500">*</span>
          </label>
          <input
            id="headline"
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g., Magical stay in the mountains"
            maxLength={255}
            disabled={loading}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">{headline.length}/255</p>
        </div>

        {/* Review Body */}
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell us about your experience..."
            disabled={loading}
            rows={5}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos <span className="text-gray-400">(optional, max 5)</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              disabled={loading || images.length >= 5}
              className="hidden"
              id="imageInput"
            />
            <label htmlFor="imageInput" className="cursor-pointer">
              <div className="text-4xl mb-2">📸</div>
              <p className="text-sm text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG or WEBP (max 5 MB each)
              </p>
            </label>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center gap-3">
          <input
            id="anonymous"
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            disabled={loading}
            className="w-4 h-4"
          />
          <label htmlFor="anonymous" className="text-sm text-gray-700">
            Post anonymously (shows "A Guest" instead of your name)
          </label>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <p className="text-sm text-green-700">
              ✓ Thank you! Your review is awaiting approval and will appear on our site soon.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !stars || !headline.trim() || !body.trim()}
          className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit Review'
          )}
        </button>
      </form>
    </div>
  );
};

export default LeaveReviewForm;
