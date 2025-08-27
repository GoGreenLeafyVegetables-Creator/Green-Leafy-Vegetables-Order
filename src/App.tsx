
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Layout from "./components/layout/Layout";
import CustomerOrderPage from "./pages/CustomerOrderPage";
import CustomerPublicPage from "./pages/CustomerPublicPage";
import CustomerOrderPageSimple from "./pages/CustomerOrderPageSimple";
import CustomerOutstandingDetailsPage from "./pages/CustomerOutstandingDetailsPage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
// Lazy load OrderFormPage to avoid potential circular dependencies
const OrderFormPage = React.lazy(() => import("./pages/OrderFormPage"));

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
          
          {/* Simple customer order page - no layout */}
          <Route path="/simple-order/:qrCode" element={<CustomerOrderPageSimple />} />
          
          {/* Customer public page route - no layout */}
          <Route path="/customer/:qrCode" element={<CustomerPublicPage />} />
          
          {/* Protected admin routes with layout */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              {/* Root path redirects to dashboard */}
              <Route index element={<Dashboard />} />
              
              {/* Order edit route */}
              <Route 
                path="orders/edit/:id" 
                element={
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <OrderFormPage />
                  </React.Suspense>
                } 
              />
              
              {/* Outstanding orders detail route */}
              <Route path="outstanding-orders/:customerId" element={<CustomerOutstandingDetailsPage />} />
              
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
