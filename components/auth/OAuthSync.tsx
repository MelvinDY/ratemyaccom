'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

/**
 * Reads the short-lived `oauth-user` cookie set by OAuth callbacks and
 * hydrates the Zustand auth store. Mounted in the root layout.
 */
export default function OAuthSync() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      return;
    }

    const match = document.cookie.match(/(?:^|;\s*)oauth-user=([^;]+)/);
    if (!match) {
      return;
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(match[1] ?? '')) as Partial<User>;
      if (typeof parsed?.id === 'string' && typeof parsed?.email === 'string') {
        useAuth.setState({
          user: parsed as User,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        // Delete the cookie
        document.cookie = 'oauth-user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
      }
    } catch {
      // malformed cookie — ignore
    }
  }, [isAuthenticated, user]);

  return null;
}
