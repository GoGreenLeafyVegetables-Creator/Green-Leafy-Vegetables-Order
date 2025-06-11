
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import OrderForm from "@/components/orders/OrderForm";
import { useCustomers, useVegetables, useCreateOrder, useUpdateOrder, useOrders } from "@/hooks/use-supabase-data";
import { useToast } from "@/components/ui/use-toast";
import { Order, OrderItem } from "@/types/order";

const OrderFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: vegetables = [], isLoading: vegetablesLoading } = useVegetables();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();

  const isEditing = !!id;
  const initialData = isEditing ? orders.find(order => order.id === id) : undefined;

  const handleSave = async (orderData: Order) => {
    try {
      const orderItems: Omit<OrderItem, 'id' | 'order_id'>[] = orderData.order_items?.map(item => ({
        vegetable_id: item.vegetable_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      })) || [];

      if (isEditing && id) {
        await updateOrder.mutateAsync({
          id,
          customer_id: orderData.customer_id,
          order_date: orderData.order_date,
          total_amount: orderData.total_amount,
          payment_status: orderData.payment_status,
          paid_amount: orderData.paid_amount,
          balance_amount: orderData.balance_amount
        });
      } else {
        const newOrder = {
          customer_id: orderData.customer_id,
          order_date: orderData.order_date,
          total_amount: orderData.total_amount,
          payment_status: orderData.payment_status as 'pending' | 'partial' | 'paid',
          paid_amount: orderData.paid_amount,
          balance_amount: orderData.balance_amount
        };
        
        await createOrder.mutateAsync({ order: newOrder, items: orderItems });
      }
      
      navigate('/orders');
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save order",
      });
    }
  };

  const handleCancel = () => {
    navigate('/orders');
  };

  if (customersLoading || vegetablesLoading || (isEditing && ordersLoading)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Order" : "Create New Order"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Edit an existing order" : "Create a new order for a customer"}
          </p>
        </div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Edit Order" : "Create New Order"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? "Edit an existing order" : "Create a new order for a customer"}
        </p>
      </div>
      <OrderForm
        onSave={handleSave}
        onCancel={handleCancel}
        customers={customers}
        vegetables={vegetables}
        initialData={initialData}
      />
    </div>
  );
};

export default OrderFormPage;
