import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username?: string;
  email?: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  name: string;
  avatar?: string;
  onboardingComplete: boolean;
  preferences?: any;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        // Always check for auth token first
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          return null;
        }

        const res = await fetch("/api/auth/user", {
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        
        if (res.status === 401) {
          // Clear invalid token
          localStorage.removeItem('authToken');
          return null;
        }
        
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        
        return await res.json();
      } catch (error) {
        console.log("Auth check failed:", error);
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
  };
}

export function useSignup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      username: string;
      email: string;
      password: string;
      name: string;
    }) => {
      return await apiRequest("/api/auth/signup", "POST", data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Account created successfully!",
        description: "Welcome to your digital closet.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return await apiRequest("/api/auth/login", "POST", data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/logout", "POST");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (preferences: any) => {
      return await apiRequest("/api/auth/complete-onboarding", "POST", { preferences });
    },
    onSuccess: (data) => {
      // Force update the user data with onboarding complete
      const updatedUser = { ...data.user, onboardingComplete: true };
      queryClient.setQueryData(["/api/auth/user"], updatedUser);
      
      // Force a query invalidation to trigger re-render but don't refetch
      queryClient.invalidateQueries({ 
        queryKey: ["/api/auth/user"],
        refetchType: 'none'
      });
      
      toast({
        title: "Welcome aboard!",
        description: "Drobeo is ready to organize your wardrobe.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Onboarding failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}