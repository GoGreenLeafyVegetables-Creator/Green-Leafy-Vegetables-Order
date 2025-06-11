
import React from "react";
import OrderList from "@/components/orders/OrderList";

const OrdersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">
          View and manage all customer orders
        </p>
      </div>
      <OrderList />
    </div>
  );
};

export default OrdersPage;
