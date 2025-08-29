import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Carrot, 
  ShoppingCart, 
  IndianRupee, 
  FileText, 
  LogOut,
  FolderOpen
} from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/customers", icon: Users, label: "Customers" },
    { path: "/vegetables", icon: Carrot, label: "Vegetables" },
    { path: "/orders", icon: ShoppingCart, label: "Orders" },
    { path: "/payments", icon: IndianRupee, label: "Payments" },
    { path: "/reports", icon: FileText, label: "Reports" },
    { path: "/backup", icon: FolderOpen, label: "Backup" }
  ];

  return (
    <nav className="bg-white border-b sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/8fa965fb-6405-4e65-ba32-8efd8d8ef4ed.png" 
              alt="Logo" 
              className="h-8 w-8"
            />
            <span className="font-bold text-lg text-green-600 hidden sm:block">
              Shree Ganesha Vegetables
            </span>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:flex space-x-1 mr-4">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link key={path} to={path}>
                  <Button
                    variant={location.pathname === path ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{label}</span>
                  </Button>
                </Link>
              ))}
            </div>
            
            {/* Mobile menu */}
            <div className="md:hidden flex space-x-1 mr-2 overflow-x-auto">
              {navItems.slice(0, 4).map(({ path, icon: Icon, label }) => (
                <Link key={path} to={path}>
                  <Button
                    variant={location.pathname === path ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center justify-center min-w-[40px]"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </Link>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile bottom navigation for remaining items */}
        <div className="md:hidden flex justify-center space-x-1 pb-2 overflow-x-auto">
          {navItems.slice(4).map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path}>
              <Button
                variant={location.pathname === path ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-1 text-xs"
              >
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
