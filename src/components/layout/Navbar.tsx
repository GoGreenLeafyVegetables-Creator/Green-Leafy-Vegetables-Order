
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ganeshaLogo from "@/assets/ganesha-logo.png";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  CreditCard, 
  FileText, 
  LogOut,
  Menu,
  Database
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('adminUser');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to localStorage cleanup
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('adminUser');
      navigate('/login');
    }
  };

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/customers", icon: Users, label: "Customers" },
    { to: "/vegetables", icon: Package, label: "Vegetables" },
    { to: "/payments", icon: CreditCard, label: "Payments" },
    { to: "/reports", icon: FileText, label: "Reports" },
    { to: "/backup", icon: Database, label: "Backup" },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top section with logo and company name */}
        <div className="flex items-center justify-center py-3 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-3">
            <img src={ganeshaLogo} alt="Ganesha Logo" className="h-16 w-16" />
            <span className="font-bold text-xl text-gray-900">
              SHREE GANESHA GREEN LEAFY VEGETABLES
            </span>
          </Link>
        </div>
        
        {/* Menu bar below */}
        <div className="flex justify-between items-center h-14">
          <div className="flex-1"></div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="text-sm font-medium text-green-600 border-b pb-2 flex items-center space-x-2">
                    <img src={ganeshaLogo} alt="Ganesha Logo" className="h-8 w-8" />
                    <span>SHREE GANESHA GREEN LEAFY VEGETABLES</span>
                  </div>
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center space-x-2 text-gray-700 hover:text-green-600 py-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <Button variant="ghost" onClick={handleLogout} className="justify-start text-red-600 hover:text-red-700 p-2">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
