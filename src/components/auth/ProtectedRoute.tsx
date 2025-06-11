
import React, { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <Outlet /> : null;
};

export default ProtectedRoute;
