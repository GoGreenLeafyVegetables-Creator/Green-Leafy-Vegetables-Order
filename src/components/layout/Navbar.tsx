
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navItems } from "@/nav-items";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("adminUser");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the admin portal",
    });
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-green-600">
                Go Green Leafy Vegetables
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems
                .filter(item => !item.hideFromNav)
                .map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    location.pathname === item.to
                      ? "border-green-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
