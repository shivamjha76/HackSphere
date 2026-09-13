"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  UserOut,
  LoginPayload,
  SignupPayload,
  authApi,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  getStoredActiveRole,
  setStoredActiveRole,
  removeStoredActiveRole,
} from "@/lib/api";

const ALL_ROLES = ["super_admin", "organizer", "judge", "participant"];

interface AuthContextType {
  user: UserOut | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeRole: string | null;
  availableRoles: string[];
  setActiveRole: (role: string) => void;
  hasRole: (role: string) => boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserOut | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeRole, setActiveRoleState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Compute available roles based on user permissions
  const availableRoles = useMemo(() => {
    if (!user) return [];
    if (user.is_superuser || (user.roles && user.roles.includes("super_admin"))) {
      // SuperAdmin has omni-mode access to test and view all 4 portal perspectives
      return ALL_ROLES;
    }
    if (user.roles && user.roles.length > 0) {
      return user.roles;
    }
    return ["participant"];
  }, [user]);

  // Synchronize active role whenever availableRoles changes
  const initActiveRole = useCallback(
    (rolesList: string[]) => {
      if (rolesList.length === 0) {
        setActiveRoleState(null);
        return;
      }

      const stored = getStoredActiveRole();
      if (stored && rolesList.includes(stored)) {
        setActiveRoleState(stored);
      } else {
        // Default to first available role (or preferred priority)
        const defaultRole = rolesList[0];
        setActiveRoleState(defaultRole);
        setStoredActiveRole(defaultRole);
      }
    },
    []
  );

  const refreshUser = useCallback(async () => {
    try {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setActiveRoleState(null);
        return;
      }
      setToken(storedToken);
      const userData = await authApi.getMe();
      setUser(userData);

      // Compute and set active role for this user
      const roles =
        userData.is_superuser || (userData.roles && userData.roles.includes("super_admin"))
          ? ALL_ROLES
          : userData.roles && userData.roles.length > 0
          ? userData.roles
          : ["participant"];
      initActiveRole(roles);
    } catch (err) {
      console.warn("Auth token validation failed:", err);
      removeStoredToken();
      removeStoredActiveRole();
      setUser(null);
      setToken(null);
      setActiveRoleState(null);
    } finally {
      setIsLoading(false);
    }
  }, [initActiveRole]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const setActiveRole = (role: string) => {
    if (availableRoles.includes(role)) {
      setActiveRoleState(role);
      setStoredActiveRole(role);
    } else {
      console.warn(`Attempted to switch to unauthorized role: ${role}`);
    }
  };

  const hasRole = (role: string): boolean => {
    return availableRoles.includes(role);
  };

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(payload);
      setStoredToken(data.access_token);
      setToken(data.access_token);
      setUser(data.user);

      const roles =
        data.user.is_superuser || (data.user.roles && data.user.roles.includes("super_admin"))
          ? ALL_ROLES
          : data.user.roles && data.user.roles.length > 0
          ? data.user.roles
          : ["participant"];
      initActiveRole(roles);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: SignupPayload) => {
    setIsLoading(true);
    try {
      const data = await authApi.signup(payload);
      setStoredToken(data.access_token);
      setToken(data.access_token);
      setUser(data.user);

      const roles = data.user.roles && data.user.roles.length > 0 ? data.user.roles : ["participant"];
      initActiveRole(roles);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeStoredToken();
    removeStoredActiveRole();
    setUser(null);
    setToken(null);
    setActiveRoleState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        activeRole,
        availableRoles,
        setActiveRole,
        hasRole,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
