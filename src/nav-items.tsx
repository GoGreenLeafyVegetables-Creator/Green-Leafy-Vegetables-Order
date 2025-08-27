
import { Home, Users, ShoppingCart, Package2, IndianRupee, BarChart3, Database, AlertTriangle } from "lucide-react";
import Index from "./pages/Index";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import VegetablesPage from "./pages/VegetablesPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReportsPage from "./pages/ReportsPage";
import BackupPage from "./pages/BackupPage";
import OutstandingOrdersPage from "./pages/OutstandingOrdersPage";

export const navItems = [
  {
    title: "Dashboard",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Customers",
    to: "/customers",
    icon: <Users className="h-4 w-4" />,
    page: <CustomersPage />,
  },
  {
    title: "Orders",
    to: "/orders",
    icon: <ShoppingCart className="h-4 w-4" />,
    page: <OrdersPage />,
  },
  {
    title: "Outstanding Orders",
    to: "/outstanding-orders",
    icon: <AlertTriangle className="h-4 w-4" />,
    page: <OutstandingOrdersPage />,
  },
  {
    title: "Vegetables",
    to: "/vegetables",
    icon: <Package2 className="h-4 w-4" />,
    page: <VegetablesPage />,
  },
  {
    title: "Payments",
    to: "/payments",
    icon: <IndianRupee className="h-4 w-4" />,
    page: <PaymentsPage />,
  },
  {
    title: "Reports",
    to: "/reports",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <ReportsPage />,
  },
  {
    title: "Backup",
    to: "/backup",
    icon: <Database className="h-4 w-4" />,
    page: <BackupPage />,
  },
];
