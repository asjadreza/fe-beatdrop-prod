"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, login as apiLogin, register as apiRegister, getProfile, LoginData, RegisterData } from '../api/auth';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch user profile with token
  const fetchUserProfile = async (authToken: string) => {
    try {
      setIsLoading(true);
      const userData = await getProfile(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (token) {
      await fetchUserProfile(token);
    }
  };

  // Login function
  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      const response = await apiLogin(data);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      toast({
        title: 'Logged in successfully',
        description: `Welcome back, ${response.user.username}!`,
      });
      router.push('/main');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await apiRegister(data);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      toast({
        title: 'Registration successful',
        description: `Welcome to BeatDrop, ${response.user.username}!`,
      });
      router.push('/main');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Could not create account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
    router.push('/');
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 