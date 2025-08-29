
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Footer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("adminUser");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of Shree Ganesha Green Leafy Vegetables admin portal",
    });
    navigate("/login");
  };

  return (
    <footer className="bg-white border-t border-gray-200 p-4">
      <div className="max-w-7xl mx-auto flex justify-center">
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
    </footer>
  );
};

export default Footer;
