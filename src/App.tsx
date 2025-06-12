
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Layout from "./components/layout/Layout";
import CustomerOrderPage from "./pages/CustomerOrderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Customer ordering app route - no layout */}
          <Route path="/order/:qrCode" element={<CustomerOrderPage />} />
          
          {/* Admin routes with layout */}
          <Route path="/" element={<Layout />}>
            {navItems.map(({ to, page }) => {
              // Convert absolute paths to relative paths for nested routing
              const relativePath = to === "/" ? "" : to.startsWith("/") ? to.slice(1) : to;
              return (
                <Route key={to} path={relativePath} element={page} />
              );
            })}
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
