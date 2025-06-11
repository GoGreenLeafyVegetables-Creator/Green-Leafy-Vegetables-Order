
import React, { useState } from "react";
import OrderList from "@/components/orders/OrderList";
import OrderDetails from "@/components/orders/OrderDetails";
import { useOrders, useCustomers, useVegetables, useDeleteOrder } from "@/hooks/use-supabase-data";
import { Order } from "@/types/order";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: vegetables = [], isLoading: vegetablesLoading } = useVegetables();
  const deleteOrder = useDeleteOrder();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleView = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleEdit = (order: Order) => {
    navigate(`/orders/edit/${order.id}`);
  };

  const handleDelete = async (orderId: string) => {
    try {
      await deleteOrder.mutateAsync(orderId);
      toast({
        title: "Order deleted",
        description: "Order has been deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete order",
      });
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  if (selectedOrder) {
    const customer = customers.find(c => c.id === selectedOrder.customer_id);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground">
            View detailed information about the order
          </p>
        </div>
        <OrderDetails
          order={selectedOrder}
          customer={customer}
          vegetables={vegetables}
          onEdit={handleEdit}
          onClose={handleCloseDetails}
        />
      </div>
    );
  }

  if (ordersLoading || customersLoading || vegetablesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">
            View and manage all customer orders
          </p>
        </div>
        <div>Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">
          View and manage all customer orders
        </p>
      </div>
      <OrderList
        orders={orders}
        customers={customers}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCustomerId={selectedCustomerId}
        setSelectedCustomerId={setSelectedCustomerId}
      />
    </div>
  );
};

export default OrdersPage;
