
import { HomeIcon, UsersIcon, ShoppingCartIcon, PackageIcon, FileTextIcon, CreditCardIcon, SettingsIcon, DollarSignIcon } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import OrderFormPage from "./pages/OrderFormPage";
import VegetablesPage from "./pages/VegetablesPage";
import ReportsPage from "./pages/ReportsPage";
import PaymentsPage from "./pages/PaymentsPage";
import PaymentUpdatePage from "./pages/PaymentUpdatePage";
import CustomerBalancePage from "./pages/CustomerBalancePage";
import BackupPage from "./pages/BackupPage";

export const navItems = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Customers",
    to: "/customers",
    icon: <UsersIcon className="h-4 w-4" />,
    page: <CustomersPage />,
  },
  {
    title: "Orders",
    to: "/orders",
    icon: <ShoppingCartIcon className="h-4 w-4" />,
    page: <OrdersPage />,
  },
  {
    title: "New Order",
    to: "/orders/new",
    icon: <ShoppingCartIcon className="h-4 w-4" />,
    page: <OrderFormPage />,
  },
  {
    title: "Vegetables",
    to: "/vegetables",
    icon: <PackageIcon className="h-4 w-4" />,
    page: <VegetablesPage />,
  },
  {
    title: "Payments",
    to: "/payments",
    icon: <CreditCardIcon className="h-4 w-4" />,
    page: <PaymentsPage />,
  },
  {
    title: "Update Payments",
    to: "/payment-updates",
    icon: <CreditCardIcon className="h-4 w-4" />,
    page: <PaymentUpdatePage />,
  },
  {
    title: "Customer Balance",
    to: "/customer-balance",
    icon: <DollarSignIcon className="h-4 w-4" />,
    page: <CustomerBalancePage />,
  },
  {
    title: "Reports",
    to: "/reports",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <ReportsPage />,
  },
  {
    title: "Backup",
    to: "/backup",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: <BackupPage />,
  },
];
