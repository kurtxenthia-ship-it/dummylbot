import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import AccountStatus from "@/pages/account-status";
import About from "@/pages/about";
import AdminDashboard from "@/pages/admin";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="font-mono text-primary animate-pulse tracking-widest text-sm">INITIALIZING_CONNECTION...</div>
    </div>;
  }
  
  if (!user) {
    return <Redirect href="/login" />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/account-status" component={() => <ProtectedRoute component={AccountStatus} />} />
      <Route path="/about" component={() => <ProtectedRoute component={About} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} />} />
      
      {/* Root redirects to dashboard */}
      <Route path="/">
        <Redirect href="/dashboard" />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
