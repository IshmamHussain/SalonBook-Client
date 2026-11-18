'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ApiError, fetchSessionToken, setAuthToken } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import type { UserProfile } from '@/types';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  blockedMessage: string | null;
  refreshAuth: () => Promise<UserProfile | null>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  const refreshAuth = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const data = await fetchSessionToken();
      setUser(data.user);
      setBlockedMessage(null);
      return data.user;
    } catch (err) {
      setUser(null);
      setAuthToken(null);
      if (err instanceof ApiError && err.code === 'USER_BLOCKED') {
        setBlockedMessage(err.message);
      } else {
        setBlockedMessage(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    function handleUserBlocked(event: Event) {
      const detail = (event as CustomEvent<string>).detail;
      setAuthToken(null);
      setUser(null);
      setBlockedMessage(detail || 'Your account has been blocked by the salon administrator.');
    }
    window.addEventListener('salonbook:user-blocked', handleUserBlocked);
    return () => window.removeEventListener('salonbook:user-blocked', handleUserBlocked);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
    } finally {
      setAuthToken(null);
      setUser(null);
      setBlockedMessage(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        blockedMessage,
        refreshAuth,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
