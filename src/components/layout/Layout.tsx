
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Toaster } from "@/components/ui/toaster";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl p-4 md:p-6">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;
