import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// Update the import path below to the correct location of Toaster, for example:
import { Toaster } from "./components/ui/Toaster";
// If the file does not exist, create 'src/components/ui/Toaster.tsx' with a basic Toaster component.
import { TooltipProvider } from "./components/ui/Tooltip";
// Update the import path if the file is actually located elsewhere, for example:
// Or, if the file does not exist, create 'src/hooks/useAuth.ts' with the following content:

// src/hooks/useAuth.ts
import { useState } from "react";

export function useAuth() {
  // Dummy implementation, replace with your actual logic
  const [isLoading] = useState(false);
  const [isAuthenticated] = useState(false);
  const [user] = useState<{ role?: string } | null>(null);

  return { isAuthenticated, isLoading, user };
}
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import UserLayout from "./components/Layout/UserLayout";
import AdminLayout from "./components/Layout/AdminLayout";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : user?.role === 'admin' ? (
        <Route path="/admin/*?" component={AdminLayout} />
      ) : (
        <Route path="/*?" component={UserLayout} />
      )}
      <Route component={NotFound} />
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
