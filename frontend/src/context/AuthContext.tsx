import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Business } from '../types';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  activeBusiness: { id: string; name: string; slug: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setActiveBusinessId: (businessId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeBusiness, setActiveBusiness] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);

      // Determine default active business if user has business memberships
      if (profile.businessMembers && profile.businessMembers.length > 0) {
        const firstBiz = profile.businessMembers[0].business;
        setActiveBusiness({
          id: firstBiz.id,
          name: firstBiz.name,
          slug: firstBiz.slug,
        });
      } else if (profile.businesses && profile.businesses.length > 0) {
        const firstBiz = profile.businesses[0];
        setActiveBusiness({
          id: firstBiz.id,
          name: firstBiz.name,
          slug: firstBiz.slug,
        });
      }
    } catch {
      setUser(null);
      setActiveBusiness(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      setUser(response.data.user);

      if (response.data.user.businesses && response.data.user.businesses.length > 0) {
        const b = response.data.user.businesses[0];
        setActiveBusiness({ id: b.id, name: b.name, slug: b.slug });
      }
      return response.data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      setUser(response.data.user);
      const resData = response.data as any;
      if (resData.business) {
        setActiveBusiness({
          id: resData.business.id,
          name: resData.business.name,
          slug: resData.business.slug,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Clean up frontend state regardless
    } finally {
      setUser(null);
      setActiveBusiness(null);
    }
  };

  const setActiveBusinessId = (businessId: string) => {
    if (!user) return;
    const match =
      user.businessMembers?.find((m) => m.business.id === businessId)?.business ||
      user.businesses?.find((b) => b.id === businessId);
    if (match) {
      setActiveBusiness({
        id: match.id,
        name: match.name,
        slug: match.slug,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeBusiness,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        setActiveBusinessId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
