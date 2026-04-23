import { useState, useCallback, useEffect } from 'react';
import { GuestSession } from '@/types/guest-portal';

export const useGuestAuth = () => {
  const [session, setSession] = useState<GuestSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load session from sessionStorage on mount
  useEffect(() => {
    const storedSession = sessionStorage.getItem('guest-portal-session');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setSession(parsed);
      } catch (e) {
        console.error('Failed to parse stored session:', e);
        sessionStorage.removeItem('guest-portal-session');
      }
    }
  }, []);

  const login = useCallback(async (identifier: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/guest-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return false;
      }

      setSession(data.data);
      sessionStorage.setItem('guest-portal-session', JSON.stringify(data.data));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    sessionStorage.removeItem('guest-portal-session');
    setError(null);
  }, []);

  const refreshSession = useCallback(async () => {
    if (!session?.token) return false;

    try {
      const response = await fetch('/api/guest/reservation', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        logout();
        return false;
      }

      setSession(data.data);
      sessionStorage.setItem('guest-portal-session', JSON.stringify(data.data));
      return true;
    } catch (err) {
      console.error('Failed to refresh session:', err);
      return false;
    }
  }, [session?.token, logout]);

  return {
    session,
    loading,
    error,
    login,
    logout,
    refreshSession,
    isAuthenticated: !!session,
  };
};
