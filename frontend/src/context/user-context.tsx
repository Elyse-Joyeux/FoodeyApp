import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const GATEWAY = (typeof process !== 'undefined' && process.env && process.env.BACKEND_URL)
  ? process.env.BACKEND_URL
  : '';
const BASE = `${GATEWAY}/foodey-service/api`;

export type User = {
  id: string;
  fullName: string;
  email: string;
  restaurantName: string;
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (fullName: string, email: string, password: string, restaurantName: string) => Promise<User | null>;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('foodey_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
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
      };

      setUser(userData);
      localStorage.setItem('foodey_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const signup = async (fullName: string, email: string, password: string, restaurantName: string): Promise<User | null> => {
    try {
      const response = await fetch(`${BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, email, password, restaurantName }),
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
      };

      setUser(userData);
      localStorage.setItem('foodey_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Signup error:', error);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('foodey_user');
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
