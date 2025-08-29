
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Layout from "./components/layout/Layout";
import CustomerPublicPage from "./pages/CustomerPublicPage";
import CustomerOrderPage from "./pages/CustomerOrderPage";
import CustomerOrderPageSimple from "./pages/CustomerOrderPageSimple";
import CustomerDetailsPage from "./pages/CustomerDetailsPage";
import CustomerBalancePage from "./pages/CustomerBalancePage";
import PaymentUpdatePage from "./pages/PaymentUpdatePage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CustomerPDFEditorPage from "./pages/CustomerPDFEditorPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/customer/:qrCode" element={<CustomerPublicPage />} />
          <Route path="/customer/:qrCode/order" element={<CustomerOrderPage />} />
          <Route path="/customer/:qrCode/order-simple" element={<CustomerOrderPageSimple />} />
          <Route path="/customer/:qrCode/details" element={<CustomerDetailsPage />} />
          <Route path="/customer/:qrCode/balance" element={<CustomerBalancePage />} />
          <Route path="/payment/:customerId" element={<PaymentUpdatePage />} />
          
          {/* Protected routes */}
          <Route path="/customers/:customerId/pdf-editor" element={
            <ProtectedRoute>
              <CustomerPDFEditorPage />
            </ProtectedRoute>
          } />
          
          {/* Main app routes */}
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={
              <ProtectedRoute>
                <Layout>
                  {page}
                </Layout>
              </ProtectedRoute>
            } />
          ))}
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
