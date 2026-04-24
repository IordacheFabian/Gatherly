import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import RequireAuth from "@/components/RequireAuth";
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated";
import { AuthProvider } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/error-utils";
import { toast } from "@/components/ui/sonner";
import Index from "./pages/Index";
import ActivityDetails from "./pages/ActivityDetails";
import CreateActivity from "./pages/CreateActivity";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Payments from "./pages/Payments";
import HostDashboard from "./pages/HostDashboard";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.skipToast) return;
      toast.error(getErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.skipToast) return;
      toast.error(getErrorMessage(error));
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/activity/:id" element={<ActivityDetails />} />
              <Route path="/profile/:userId?" element={<Profile />} />
              <Route element={<RequireAuth />}>
                <Route path="/create" element={<CreateActivity />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/dashboard" element={<HostDashboard />} />
              </Route>
              <Route element={<RedirectIfAuthenticated />}>
                <Route path="/auth" element={<Auth />} />
              </Route>
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
