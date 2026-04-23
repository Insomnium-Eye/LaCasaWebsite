'use client';

import { useState, useEffect } from 'react';
import { Review } from '@/types/guest-portal';

const AdminReviewsDashboard = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState({ username: '', password: '', authenticated: false });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const credentials = btoa(`${auth.username}:${auth.password}`);

    try {
      const response = await fetch('/api/admin/reviews', {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        setError('Invalid credentials');
        return;
      }

      const data = await response.json();
      setReviews(data.data);
      setAuth({ ...auth, authenticated: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (reviewId: string, action: 'approve' | 'reject') => {
    setActionLoading(reviewId);
    setError(null);

    const credentials = btoa(`${auth.username}:${auth.password}`);

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/${action}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        setError('Failed to process review');
        return;
      }

      // Remove from list
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  if (!auth.authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-amber-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={auth.username}
                onChange={(e) => setAuth({ ...auth, username: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={auth.password}
                onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Review Moderation</h1>
          <button
            onClick={() => setAuth({ username: '', password: '', authenticated: false })}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium"
          >
            Sign Out
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No pending reviews to moderate</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < review.stars ? '⭐' : '☆'}>
                            {i < review.stars ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {review.anonymous ? 'A Guest' : `Guest #${review.reservation_id.slice(0, 8)}`}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{review.headline}</h3>
                  </div>
                  <span className="text-xs text-gray-500 ml-4">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Body */}
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.body}</p>

                {/* Images */}
                {review.images && review.images.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {review.images.map((image) => (
                      <a
                        key={image.id}
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group"
                      >
                        <img
                          src={image.url}
                          alt="Review"
                          className="w-full h-24 object-cover rounded-lg hover:opacity-75 transition-opacity"
                        />
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                          🔗
                        </span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApproveReject(review.id, 'approve')}
                    disabled={actionLoading === review.id}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    {actionLoading === review.id ? '⏳ Processing...' : '✓ Approve'}
                  </button>
                  <button
                    onClick={() => handleApproveReject(review.id, 'reject')}
                    disabled={actionLoading === review.id}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    {actionLoading === review.id ? '⏳ Processing...' : '✕ Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsDashboard;
