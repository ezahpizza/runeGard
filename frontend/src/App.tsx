import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthWrapper } from "./components/auth/AuthWrapper";
import { Layout } from "./components/shared/Layout";
import RequireUserInit from "./components/auth/RequireUserInit";
import Loading from "./components/ui/Loading";
import LandingPage from "./pages/LandingPage";
import Explore from "./pages/Explore";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import EditProject from "./pages/EditProject";
import ProjectDetail from "./pages/ProjectDetail";
import Profile from "./pages/Profile";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 10 minutes by default
      staleTime: 10 * 60 * 1000,
      // Keep data in cache for 15 minutes
      gcTime: 15 * 60 * 1000,
      // Don't refetch on window focus to reduce unnecessary requests
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect unless data is stale
      refetchOnReconnect: 'always',
      // Retry failed requests with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry client errors (4xx) except 401
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 401) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once on failure
      retry: (failureCount, error: any) => {
        // Don't retry client errors (4xx)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthWrapper
          fallback={<Loading message="Setting up application..." />}
        >
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/explore" element={<Explore />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireUserInit>
                      <Dashboard />
                    </RequireUserInit>
                  }
                />
                <Route
                  path="/projects/new"
                  element={
                    <RequireUserInit>
                      <CreateProject />
                    </RequireUserInit>
                  }
                />
                <Route
                  path="/projects/:id"
                  element={
                    <RequireUserInit>
                      <ProjectDetail />
                    </RequireUserInit>
                  }
                />
                <Route
                  path="/projects/edit/:id"
                  element={
                    <RequireUserInit>
                      <EditProject />
                    </RequireUserInit>
                  }
                />
                <Route path="/profile/:user_id" element={<Profile />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/about" element={<NotFound />} />
                <Route path="/developer" element={<NotFound />} />
                <Route path="/privacy-policy" element={<NotFound />} />
                <Route path="/code-of-conduct" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AuthWrapper>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;
