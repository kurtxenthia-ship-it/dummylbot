import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useGetMe, getGetMeQueryKey, useLogin, useLogout, useRegister } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User, LoginInput, RegisterInput } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null | undefined;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false,
      staleTime: Infinity,
    }
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const login = async (data: LoginInput) => {
    try {
      const res = await loginMutation.mutateAsync({ data });
      queryClient.setQueryData(getGetMeQueryKey(), res.user);
      setLocation("/dashboard");
      toast({ title: "Logged in successfully" });
    } catch (err: any) {
      toast({ title: "Login failed", description: err?.error || "Unknown error", variant: "destructive" });
      throw err;
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      const res = await registerMutation.mutateAsync({ data });
      queryClient.setQueryData(getGetMeQueryKey(), res.user);
      setLocation("/dashboard");
      toast({ title: "Registered successfully" });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err?.error || "Unknown error", variant: "destructive" });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      queryClient.setQueryData(getGetMeQueryKey(), null);
      setLocation("/login");
      toast({ title: "Logged out" });
    } catch (err: any) {
      toast({ title: "Logout failed", description: err?.error || "Unknown error", variant: "destructive" });
    }
  };

  const effectiveUser = error ? null : user;

  return (
    <AuthContext.Provider value={{ user: effectiveUser, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
