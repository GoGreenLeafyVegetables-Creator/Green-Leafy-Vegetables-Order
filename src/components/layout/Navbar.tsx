
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/customers", label: "Customers" },
    { path: "/vegetables", label: "Vegetables" },
    { path: "/orders", label: "Orders" },
    { path: "/reports", label: "Reports" },
  ];

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-xl">
          <span className="text-primary">🥬</span>
          <span className="hidden md:inline-block">Vegetable Order Management</span>
          <span className="md:hidden">VOM</span>
        </div>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <div className="hidden md:flex md:items-center md:gap-4">
            {navItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "text-sm transition-colors",
                  isActive(item.path) ? "bg-primary text-primary-foreground" : ""
                )}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </nav>
      </div>
      <div className="md:hidden overflow-x-auto scrollbar-hide">
        <div className="flex px-4 pb-2 gap-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              variant={isActive(item.path) ? "default" : "outline"}
              size="sm"
              className={cn(
                "text-sm whitespace-nowrap",
                isActive(item.path) ? "bg-primary text-primary-foreground" : ""
              )}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
