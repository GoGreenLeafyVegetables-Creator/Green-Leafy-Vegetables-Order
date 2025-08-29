
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated) {
        // Clear any existing state and redirect to login
        localStorage.clear();
        navigate("/login", { replace: true });
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
    
    // Also check on storage changes (logout from another tab)
    const handleStorageChange = () => {
      const currentAuth = localStorage.getItem("isAuthenticated") === "true";
      if (!currentAuth) {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, navigate, location.pathname]);

  // Show loading state while checking authentication
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
