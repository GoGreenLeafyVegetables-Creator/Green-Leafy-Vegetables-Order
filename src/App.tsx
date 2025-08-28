
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Index from "./pages/Index";
import Login from "./pages/Login";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import VegetablesPage from "./pages/VegetablesPage";
import ReportsPage from "./pages/ReportsPage";
import PaymentsPage from "./pages/PaymentsPage";
import BackupPage from "./pages/BackupPage";
import CustomerDetailsPage from "./pages/CustomerDetailsPage";
import OrderFormPage from "./pages/OrderFormPage";
import CustomerOrderPage from "./pages/CustomerOrderPage";
import CustomerOrderPageSimple from "./pages/CustomerOrderPageSimple";
import CustomerPublicPage from "./pages/CustomerPublicPage";
import PaymentUpdatePage from "./pages/PaymentUpdatePage";
import CustomerBalancePage from "./pages/CustomerBalancePage";
import PDFEditorPage from "./pages/PDFEditorPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/customer/:qrCode" element={<CustomerPublicPage />} />
          <Route path="/customer/:customerId/order" element={<CustomerOrderPage />} />
          <Route path="/customer/:customerId/order-simple" element={<CustomerOrderPageSimple />} />
          
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/new" element={<ProtectedRoute><OrderFormPage /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
          <Route path="/customers/:customerId" element={<ProtectedRoute><CustomerDetailsPage /></ProtectedRoute>} />
          <Route path="/vegetables" element={<ProtectedRoute><VegetablesPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/payments/:customerId" element={<ProtectedRoute><PaymentUpdatePage /></ProtectedRoute>} />
          <Route path="/balance/:customerId" element={<ProtectedRoute><CustomerBalancePage /></ProtectedRoute>} />
          <Route path="/backup" element={<ProtectedRoute><BackupPage /></ProtectedRoute>} />
          <Route path="/pdf-editor/:customerId" element={<ProtectedRoute><PDFEditorPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
