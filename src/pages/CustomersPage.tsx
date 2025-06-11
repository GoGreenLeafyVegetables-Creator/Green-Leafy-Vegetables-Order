
import React from "react";
import CustomerManagement from "@/components/customers/CustomerManagement";

const CustomersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
        <p className="text-muted-foreground">
          Manage customers, view their business analytics, and generate QR codes
        </p>
      </div>
      <CustomerManagement />
    </div>
  );
};

export default CustomersPage;
