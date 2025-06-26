import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Dashboard from "@/pages/dashboard";
import Closet from "@/pages/closet";
import Outfits from "@/pages/outfits";
import Calendar from "@/pages/calendar";
import Profile from "@/pages/profile";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import PhoneLogin from "@/pages/phone-login";
import PhoneSignup from "@/pages/phone-signup";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Auto-login with phone number +15551234588 for development
  useEffect(() => {
    const autoLogin = async () => {
      // Check if already authenticated
      if (isAuthenticated) {
        return;
      }

      // Check if we have an existing token
      const existingToken = localStorage.getItem('authToken');
      if (existingToken) {
        // Force query invalidation to check existing token
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        return;
      }

      try {
        // Call development auto-login endpoint
        const response = await fetch('/api/auth/dev-login', {
          method: 'POST',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Store auth token
          if (data.authToken) {
            localStorage.setItem('authToken', data.authToken);
          }
          
          // Set user data in cache
          queryClient.setQueryData(["/api/auth/user"], data.user);
          
          console.log("Auto-login successful for user:", data.user.phoneNumber);
        } else {
          console.log("Auto-login failed:", response.statusText);
        }
      } catch (error) {
        console.log("Auto-login failed:", error);
      }
    };

    // Run auto-login after initial load
    if (!isLoading) {
      autoLogin();
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/phone-login" component={PhoneLogin} />
          <Route path="/phone-signup" component={PhoneSignup} />
          <Route component={Login} />
        </>
      ) : user && !user.onboardingComplete ? (
        <>
          <Route path="/onboarding" component={Onboarding} />
          <Route component={Onboarding} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/closet" component={Closet} />
          <Route path="/outfits" component={Outfits} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
