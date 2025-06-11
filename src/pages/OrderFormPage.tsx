
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OrderForm from "@/components/orders/OrderForm";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Order } from "@/types/order";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";
import { useToast } from "@/components/ui/use-toast";

const OrderFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orders, setOrders] = useLocalStorage<Order[]>("orders", []);
  const [customers] = useLocalStorage<Customer[]>("customers", []);
  const [vegetables] = useLocalStorage<Vegetable[]>("vegetables", []);
  const [currentOrder, setCurrentOrder] = useState<Order | undefined>(undefined);
  const { toast } = useToast();
  
  const isEditMode = !!id;

  useEffect(() => {
    // If we're in edit mode, find the order
    if (isEditMode) {
      const foundOrder = orders.find(order => order.id === id);
      
      if (foundOrder) {
        setCurrentOrder(foundOrder);
      } else {
        // Order not found, redirect back to orders page
        toast({
          variant: "destructive",
          title: "Order not found",
          description: "The requested order could not be found",
        });
        navigate("/orders");
      }
    }
  }, [id, orders, navigate, toast, isEditMode]);

  const handleSaveOrder = (order: Order) => {
    if (isEditMode) {
      // Update existing order
      setOrders(orders.map(o => o.id === order.id ? order : o));
      
      toast({
        title: "Order Updated",
        description: "The order has been updated successfully",
      });
    } else {
      // Add new order
      setOrders([...orders, order]);
      
      toast({
        title: "Order Created",
        description: "The order has been created successfully",
      });
    }
    
    navigate("/orders");
  };

  const handleCancel = () => {
    navigate("/orders");
  };

  // Don't render until we have the order in edit mode
  if (isEditMode && !currentOrder) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {isEditMode ? "Edit Order" : "New Order"}
        </h1>
      </div>
      
      <OrderForm
        onSave={handleSaveOrder}
        onCancel={handleCancel}
        customers={customers}
        vegetables={vegetables}
        initialData={currentOrder}
      />
    </div>
  );
};

export default OrderFormPage;
