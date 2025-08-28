
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Home, 
  ShoppingCart, 
  Users, 
  Carrot, 
  CreditCard, 
  FileText, 
  Database,
  LogOut
} from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/orders", label: "Orders", icon: ShoppingCart },
    { path: "/customers", label: "Customers", icon: Users },
    { path: "/vegetables", label: "Vegetables", icon: Carrot },
    { path: "/payments", label: "Payments", icon: CreditCard },
    { path: "/reports", label: "Reports", icon: FileText },
    { path: "/backup", label: "Backup", icon: Database },
  ];

  const NavLink = ({ item, onClick }: { item: typeof navItems[0], onClick?: () => void }) => (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
        isActive(item.path)
          ? "bg-primary text-primary-foreground"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      <span>{item.label}</span>
    </Link>
  );

  return (
    <nav className="bg-white shadow-sm border-b w-full">
      <div className="w-full px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img 
              src="/lovable-uploads/8fa965fb-6405-4e65-ba32-8efd8d8ef4ed.png" 
              alt="Lord Ganesha - Go Green Leafy Vegetables Logo"
              className="h-10 w-10 rounded-lg"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                GO GREEN LEAFY
              </h1>
              <p className="text-xs text-gray-600 leading-none">
                VEGETABLES
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl overflow-x-auto">
            <div className="flex items-center space-x-1 min-w-max">
              {navItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          </div>

          {/* Right side - Logout button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>

            {/* Mobile menu trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <img 
                      src="/lovable-uploads/8fa965fb-6405-4e65-ba32-8efd8d8ef4ed.png" 
                      alt="Logo"
                      className="h-8 w-8 rounded-lg"
                    />
                    <div>
                      <h2 className="font-bold text-gray-900">GO GREEN LEAFY</h2>
                      <p className="text-xs text-gray-600">VEGETABLES</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <NavLink 
                        key={item.path} 
                        item={item} 
                        onClick={() => setIsOpen(false)}
                      />
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
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
