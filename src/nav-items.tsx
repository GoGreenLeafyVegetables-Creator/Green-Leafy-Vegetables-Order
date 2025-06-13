
import { HomeIcon, Users, Leaf, ClipboardList, CreditCard, FileText, Database, DollarSign } from "lucide-react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CustomersPage from "./pages/CustomersPage";
import VegetablesPage from "./pages/VegetablesPage";
import OrdersPage from "./pages/OrdersPage";
import OrderFormPage from "./pages/OrderFormPage";
import PaymentsPage from "./pages/PaymentsPage";
import PaymentUpdatePage from "./pages/PaymentUpdatePage";
import ReportsPage from "./pages/ReportsPage";
import BackupPage from "./pages/BackupPage";

export const navItems = [
  {
    title: "Dashboard",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Customers",
    to: "/customers",
    icon: <Users className="h-4 w-4" />,
    page: <CustomersPage />,
  },
  {
    title: "Vegetables",
    to: "/vegetables",
    icon: <Leaf className="h-4 w-4" />,
    page: <VegetablesPage />,
  },
  {
    title: "Orders",
    to: "/orders",
    icon: <ClipboardList className="h-4 w-4" />,
    page: <OrdersPage />,
  },
  {
    title: "New Order",
    to: "/orders/new",
    icon: <ClipboardList className="h-4 w-4" />,
    page: <OrderFormPage />,
    hideFromNav: true,
  },
  {
    title: "Edit Order",
    to: "/orders/edit/:id",
    icon: <ClipboardList className="h-4 w-4" />,
    page: <OrderFormPage />,
    hideFromNav: true,
  },
  {
    title: "Payments",
    to: "/payments",
    icon: <CreditCard className="h-4 w-4" />,
    page: <PaymentsPage />,
  },
  {
    title: "Update Payments",
    to: "/payments/update",
    icon: <DollarSign className="h-4 w-4" />,
    page: <PaymentUpdatePage />,
  },
  {
    title: "Reports",
    to: "/reports",
    icon: <FileText className="h-4 w-4" />,
    page: <ReportsPage />,
  },
  {
    title: "Backup & Export",
    to: "/backup",
    icon: <Database className="h-4 w-4" />,
    page: <BackupPage />,
  },
];
