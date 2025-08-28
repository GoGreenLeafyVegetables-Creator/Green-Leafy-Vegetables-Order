
import {
  HomeIcon,
  ShoppingCart,
  Users,
  Leaf,
  FileBarChart,
  CreditCard,
  Archive,
} from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Vegetables",
    url: "/vegetables",
    icon: Leaf,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileBarChart,
  },
  {
    title: "Payments",
    url: "/payments",
    icon: CreditCard,
  },
  {
    title: "Backup",
    url: "/backup",
    icon: Archive,
  },
];

// Hidden routes that don't appear in navigation but are accessible
export const hiddenRoutes = [
  {
    path: "/pdf-editor/:customerId",
    component: "PDFEditorPage",
  },
];
