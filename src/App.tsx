
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Layout from "./components/layout/Layout";
import CustomerOrderPage from "./pages/CustomerOrderPage";
import CustomerPublicPage from "./pages/CustomerPublicPage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Login route - no layout */}
          <Route path="/login" element={<Login />} />
          
          {/* Customer ordering app route - no layout */}
          <Route path="/order/:qrCode" element={<CustomerOrderPage />} />
          
          {/* Customer public page route - no layout */}
          <Route path="/customer/:qrCode" element={<CustomerPublicPage />} />
          
          {/* Protected admin routes with layout */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              {/* Root path redirects to dashboard */}
              <Route index element={<Dashboard />} />
              
              {navItems.map(({ to, page }) => {
                // Convert absolute paths to relative paths for nested routing
                const relativePath = to === "/" ? "" : to.startsWith("/") ? to.slice(1) : to;
                return (
                  <Route key={to} path={relativePath} element={page} />
                );
              })}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
