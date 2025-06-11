
import React from "react";
import OrderForm from "@/components/orders/OrderForm";

const OrderFormPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
        <p className="text-muted-foreground">
          Create a new order for a customer
        </p>
      </div>
      <OrderForm />
    </div>
  );
};

export default OrderFormPage;
