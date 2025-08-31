
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import OrderForm from "@/components/orders/OrderForm";
import { useCustomers, useVegetables, useCreateOrder, useUpdateOrder, useOrders } from "@/hooks/use-supabase-data";
import { useToast } from "@/components/ui/use-toast";
import { Order, OrderItem } from "@/types/order";

const OrderFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preSelectedCustomerId = searchParams.get('customer');
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
      console.log('Saving order:', orderData);
      
      if (isEditing && id) {
        // Update existing order
        const updateData = {
          id,
          customer_id: orderData.customer_id,
          order_date: orderData.order_date,
          total_amount: orderData.total_amount,
          payment_status: orderData.payment_status,
          payment_method: orderData.payment_method,
          paid_amount: orderData.paid_amount,
          balance_amount: orderData.balance_amount
        };

        console.log('Updating order with data:', updateData);
        await updateOrder.mutateAsync(updateData);
        
        toast({
          title: "Order Updated",
          description: "Order has been updated successfully",
        });
      } else {
        // Create new order
        const orderItems: Omit<OrderItem, 'id' | 'order_id'>[] = orderData.order_items?.map(item => ({
          vegetable_id: item.vegetable_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        })) || [];

        const newOrder = {
          customer_id: orderData.customer_id,
          order_date: orderData.order_date,
          total_amount: orderData.total_amount,
          payment_status: orderData.payment_status as 'pending' | 'partial' | 'paid',
          payment_method: orderData.payment_method as 'cash' | 'upi' | 'mixed' | 'adjustment',
          paid_amount: orderData.paid_amount,
          balance_amount: orderData.balance_amount
        };

        console.log('Creating order with data:', { order: newOrder, items: orderItems });
        await createOrder.mutateAsync({ order: newOrder, items: orderItems });
        
        toast({
          title: "Order Created",
          description: "Order has been created successfully",
        });
      }
      
      navigate('/orders');
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} order. Please try again.`,
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

  // Show error if editing but no order found
  if (isEditing && !initialData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Not Found</h1>
          <p className="text-muted-foreground">
            The order you're trying to edit could not be found.
          </p>
        </div>
        <button onClick={() => navigate('/orders')} className="text-blue-600 hover:underline">
          Back to Orders
        </button>
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
        preSelectedCustomerId={preSelectedCustomerId}
      />
    </div>
  );
};

export default OrderFormPage;
