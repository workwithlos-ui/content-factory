'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import * as storage from './storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (email: string, password: string, name: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticated = storage.isAuthenticated();
    if (authenticated) {
      const u = storage.getUser();
      setUser(u);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const u = storage.login(email, password);
    if (u) {
      setUser(u);
      return { success: true };
    }
    // For demo: auto-create account if not exists
    const newUser = storage.signup(email, password, email.split('@')[0]);
    setUser(newUser);
    return { success: true };
  }, []);

  const signup = useCallback((email: string, password: string, name: string) => {
    const existing = storage.getUser();
    if (existing && existing.email === email) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const u = storage.signup(email, password, name);
    setUser(u);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    storage.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    const updated = storage.updateUser(updates);
    if (updated) setUser(updated);
  }, []);

  const refreshUser = useCallback(() => {
    const u = storage.getUser();
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user && storage.isAuthenticated(),
      login,
      signup,
      logout,
      updateUser,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
