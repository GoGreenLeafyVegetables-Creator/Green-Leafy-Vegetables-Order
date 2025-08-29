
import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl p-4 md:p-6">
        {children || <Outlet />}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Layout;
