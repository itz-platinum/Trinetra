import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { User } from '../types';
import { auth, googleProvider } from '../lib/firebase';
import {
  apiClient,
  setTokenProvider,
  setManualSessionToken,
  getManualSessionToken,
  setUnauthorizedHandler,
} from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (loginVal: string, passVal: string) => Promise<void>;
  register: (fullName: string, email: string, username: string, passVal: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const authActionInFlightRef = useRef<boolean>(false);
  const fetchSeqRef = useRef<number>(0);

  const fetchCurrentUser = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    try {
      const data = await apiClient.get<{ user: User }>('/api/auth/me', {
        skipUnauthorizedHandler: true,
      });
      if (seq === fetchSeqRef.current) {
        setUser(data.user);
      }
    } catch {
      if (seq === fetchSeqRef.current && !authActionInFlightRef.current) {
        setUser(null);
      }
    } finally {
      if (seq === fetchSeqRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    setTokenProvider(async (forceRefresh = false) => {
      if (auth.currentUser) {
        try {
          return await auth.currentUser.getIdToken(forceRefresh);
        } catch {
          return null;
        }
      }
      return null;
    });

    setUnauthorizedHandler(() => {
      fetchSeqRef.current++;
      setManualSessionToken(null);
      setUser(null);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (authActionInFlightRef.current) {
        return;
      }
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const isPublicProfileRoute =
        path.startsWith('/u/') || path.startsWith('/@') || path.startsWith('/pay/');

      if (firebaseUser) {
        // Firebase session active; ensure manual token doesn't shadow it
        setManualSessionToken(null);
        await fetchCurrentUser();
      } else if (getManualSessionToken()) {
        await fetchCurrentUser();
      } else if (isPublicProfileRoute) {
        setUser(null);
        setLoading(false);
      } else {
        // Also check cookie-based session if present
        await fetchCurrentUser();
      }
    });

    return () => {
      unsubscribe();
      setTokenProvider(null);
      setUnauthorizedHandler(null);
    };
  }, [fetchCurrentUser]);

  const login = async (loginVal: string, passVal: string) => {
    authActionInFlightRef.current = true;
    fetchSeqRef.current++;
    try {
      if (auth.currentUser) {
        await signOut(auth).catch(() => {});
      }
      const data = await apiClient.post<{ token: string; user: User }>(
        '/api/auth/login',
        { login: loginVal, password: passVal },
        { skipUnauthorizedHandler: true, isAuthEndpoint: true }
      );
      if (data.token) {
        setManualSessionToken(data.token);
      }
      setUser(data.user);
      setLoading(false);
    } finally {
      authActionInFlightRef.current = false;
    }
  };

  const register = async (
    fullName: string,
    email: string,
    username: string,
    passVal: string
  ) => {
    authActionInFlightRef.current = true;
    fetchSeqRef.current++;
    try {
      if (auth.currentUser) {
        await signOut(auth).catch(() => {});
      }
      const data = await apiClient.post<{ token: string; user: User }>(
        '/api/auth/register',
        { full_name: fullName, email, username, password: passVal },
        { skipUnauthorizedHandler: true, isAuthEndpoint: true }
      );
      if (data.token) {
        setManualSessionToken(data.token);
      }
      setUser(data.user);
      setLoading(false);
    } finally {
      authActionInFlightRef.current = false;
    }
  };

  const loginWithGoogle = async () => {
    authActionInFlightRef.current = true;
    fetchSeqRef.current++;
    try {
      setManualSessionToken(null);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);

      const data = await apiClient.post<{ user: User }>(
        '/api/auth/google',
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          skipUnauthorizedHandler: true,
          isAuthEndpoint: true,
        }
      );
      setUser(data.user);
      setLoading(false);
    } finally {
      authActionInFlightRef.current = false;
    }
  };

  const logout = async () => {
    authActionInFlightRef.current = true;
    fetchSeqRef.current++;
    try {
      try {
        await apiClient.post('/api/auth/logout', undefined, {
          skipUnauthorizedHandler: true,
        });
      } catch {
        // Ignore if session already expired
      }
      setManualSessionToken(null);
      if (auth.currentUser) {
        await signOut(auth).catch(() => {});
      }
      setUser(null);
    } finally {
      authActionInFlightRef.current = false;
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
