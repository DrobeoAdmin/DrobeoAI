import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import Closet from "@/pages/closet";
import Outfits from "@/pages/outfits";
import Calendar from "@/pages/calendar";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

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
