
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <div className="container mx-auto px-4 py-6 max-w-full">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
