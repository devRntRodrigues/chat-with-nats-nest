'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthUser = {
  id: string;
  name: string;
  username: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  authenticator: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: (input: { username: string; password: string }) => Promise<void>;
  register: (input: { name: string; username: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'token';
const AUTHENTICATOR_KEY = 'nats_authenticator';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [authenticator, setAuthenticator] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token;

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTHENTICATOR_KEY);
    setToken(null);
    setAuthenticator(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      logout();
      return;
    }

    const response = await res.json();
    const data = response.data;
    setUser(data.user);
  }, [token, logout]);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedAuthenticator = localStorage.getItem(AUTHENTICATOR_KEY);
    
    if (savedToken) {
      setToken(savedToken);
      if (savedAuthenticator) {
        setAuthenticator(savedAuthenticator);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    (async () => {
      setIsLoading(true);
      await refreshMe();
      setIsLoading(false);
    })();
  }, [token, refreshMe]);

  const login = useCallback(async (input: { username: string; password: string }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail ?? 'Login failed');
    }

    const response = await res.json();
    const data = response.data;

    localStorage.setItem(TOKEN_KEY, data.token);
    if (data.authenticator) {
      localStorage.setItem(AUTHENTICATOR_KEY, data.authenticator);
      setAuthenticator(data.authenticator);
    }
    setToken(data.token);
    setUser(data.user);
    setIsLoading(false);
  }, []);

  const register = useCallback(
    async (input: { name: string; username: string; password: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail ?? 'Registration failed');
      }

      const response = await res.json();
      const data = response.data;

      localStorage.setItem(TOKEN_KEY, data.token);
      if (data.authenticator) {
        localStorage.setItem(AUTHENTICATOR_KEY, data.authenticator);
        setAuthenticator(data.authenticator);
      }
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, authenticator, isAuthenticated, isLoading, login, register, logout, refreshMe }),
    [user, token, authenticator, isAuthenticated, isLoading, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
