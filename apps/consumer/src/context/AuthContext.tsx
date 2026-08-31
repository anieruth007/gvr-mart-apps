import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResponse, AuthUser } from '@gvr-mart/shared-types';
import { api, configureApiClient } from '../api/client';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<{ devOtp: string }>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'gvrmart.auth.v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokensRef = useRef<{ accessToken: string | null; refreshToken: string | null }>({
    accessToken: null,
    refreshToken: null,
  });

  useEffect(() => {
    configureApiClient({
      getAccessToken: () => tokensRef.current.accessToken,
      refreshAccessToken: async () => {
        const rt = tokensRef.current.refreshToken;
        if (!rt) return null;
        try {
          const res = await api.post<{ accessToken: string }>('/auth/refresh', { refreshToken: rt });
          tokensRef.current.accessToken = res.accessToken;
          return res.accessToken;
        } catch {
          return null;
        }
      },
      onAuthFailure: () => {
        setUser(null);
        tokensRef.current = { accessToken: null, refreshToken: null };
        AsyncStorage.removeItem(STORAGE_KEY);
      },
    });

    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthResponse;
        tokensRef.current = { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken };
        setUser(parsed.user);
      }
      setIsLoading(false);
    })();
  }, []);

  const sendOtp = async (phone: string) => {
    const res = await api.post<{ devOtp: string }>('/auth/send-otp', { phone, context: 'CONSUMER' });
    return res;
  };

  const verifyOtp = async (phone: string, code: string) => {
    const res = await api.post<AuthResponse>('/auth/verify-otp', { phone, code });
    tokensRef.current = { accessToken: res.accessToken, refreshToken: res.refreshToken };
    setUser(res.user);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res));
  };

  const logout = async () => {
    tokensRef.current = { accessToken: null, refreshToken: null };
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, sendOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
