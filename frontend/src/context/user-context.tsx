import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const GATEWAY = import.meta.env.VITE_BACKEND_URL || '';
const BASE = `${GATEWAY}/foodey-service/api`;

export type User = {
  id: string;
  fullName: string;
  email: string;
  restaurantName: string;
  avatar?: string;
  role?: string;
  permissions: Permissions;
};

export type Permission = 'Dashboard' | 'Reports' | 'Inventory' | 'Orders' | 'Settings';
export type Permissions = Record<Permission, boolean>;

const DEFAULT_PERMISSIONS: Permissions = {
  Dashboard: false,
  Reports: false,
  Inventory: false,
  Orders: false,
  Settings: false,
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  requestOtp: (email: string) => Promise<string>;
  verifyOtp: (email: string, code: string) => Promise<User | null>;
  signup: (payload: SignupPayload) => Promise<User | null>;
  updateProfile: (payload: Partial<Pick<User, 'fullName' | 'email' | 'restaurantName' | 'avatar'>>) => Promise<User | null>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
};

export type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
  restaurantName: string;
  restaurantType: string;
  employeeCount: number;
  chefCount: number;
  serviceStyle: string;
  managerName?: string;
  managerEmail?: string;
  chefName?: string;
  chefEmail?: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch(`${BASE}/auth/me`, { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data) {
          setUser({
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            restaurantName: data.restaurantName,
            avatar: data.avatar,
            role: data.role,
            permissions: { ...DEFAULT_PERMISSIONS, ...(data.permissions || {}) },
          });
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      const userData: User = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        restaurantName: data.restaurantName,
        avatar: data.avatar,
        role: data.role,
        permissions: { ...DEFAULT_PERMISSIONS, ...(data.permissions || {}) },
      };

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const requestOtp = async (email: string): Promise<string> => {
    const response = await fetch(`${BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not send OTP');
    return data.message || 'If that account exists, an OTP code has been sent.';
  };

  const verifyOtp = async (email: string, code: string): Promise<User | null> => {
    const response = await fetch(`${BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, code }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'OTP verification failed');
    const userData: User = {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      restaurantName: data.restaurantName,
      avatar: data.avatar,
      role: data.role,
      permissions: { ...DEFAULT_PERMISSIONS, ...(data.permissions || {}) },
    };
    setUser(userData);
    return userData;
  };

  const signup = async (payload: SignupPayload): Promise<User | null> => {
    try {
      const response = await fetch(`${BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      const userData: User = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        restaurantName: data.restaurantName,
        avatar: data.avatar,
        role: data.role,
        permissions: { ...DEFAULT_PERMISSIONS, ...(data.permissions || {}) },
      };

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    fetch(`${BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => undefined);
  };

  const updateProfile = async (payload: Partial<Pick<User, 'fullName' | 'email' | 'restaurantName' | 'avatar'>>): Promise<User | null> => {
    const response = await fetch(`${BASE}/profile`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Profile update failed');
    }
    const data = await response.json();
    const userData: User = {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      restaurantName: data.restaurantName,
      avatar: data.avatar,
      role: data.role,
      permissions: { ...DEFAULT_PERMISSIONS, ...(data.permissions || {}) },
    };
    setUser(userData);
    return userData;
  };

  const hasPermission = (permission: Permission) => Boolean(user?.permissions?.[permission]);

  return (
    <UserContext.Provider value={{ user, isLoading, login, requestOtp, verifyOtp, signup, updateProfile, logout, hasPermission }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
