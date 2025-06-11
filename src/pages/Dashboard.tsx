
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import RecentOrdersList from "@/components/dashboard/RecentOrdersList";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import OrderDetails from "@/components/orders/OrderDetails";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Users, Leaf, ClipboardList, Truck } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";
import { Order } from "@/types/order";

const Dashboard = () => {
  const navigate = useNavigate();
  const [customers] = useLocalStorage<Customer[]>("customers", []);
  const [vegetables] = useLocalStorage<Vegetable[]>("vegetables", []);
  const [orders] = useLocalStorage<Order[]>("orders", []);
  
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  
  // Calculate stats
  const totalCustomers = customers.length;
  const totalVegetables = vegetables.length;
  const totalOrders = orders.length;
  
  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Handle order view
  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
  };
  
  const handleEditOrder = (order: Order) => {
    setViewingOrder(null);
    navigate(`/orders/edit/${order.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={() => navigate("/orders/new")}>New Order</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Customers" 
          value={totalCustomers.toString()} 
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Vegetables" 
          value={totalVegetables.toString()} 
          icon={<Leaf className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Total Orders" 
          value={totalOrders.toString()} 
          icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toFixed(2)}`}
          icon={<Truck className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <RecentOrdersList 
          orders={orders} 
          customers={customers}
          onViewOrder={handleViewOrder}
        />
        <LowStockAlert 
          orders={orders} 
          vegetables={vegetables}
          days={7}
        />
      </div>
      
      <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
        {viewingOrder && (
          <DialogContent className="max-w-3xl">
            <OrderDetails
              order={viewingOrder}
              customer={customers.find(c => c.id === viewingOrder.customerId)}
              vegetables={vegetables}
              onEdit={handleEditOrder}
              onClose={() => setViewingOrder(null)}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Dashboard;
