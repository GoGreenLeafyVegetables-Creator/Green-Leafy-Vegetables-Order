
import React from "react";
import { useCustomers, useOrders, useVegetables } from "@/hooks/use-supabase-data";
import StatCard from "@/components/dashboard/StatCard";
import RecentOrdersList from "@/components/dashboard/RecentOrdersList";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import { Users, ShoppingCart, Package, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const { data: customers = [] } = useCustomers();
  const { data: orders = [] } = useOrders();
  const { data: vegetables = [] } = useVegetables();

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  
  // Calculate pending payments
  const pendingPayments = orders.reduce((sum, order) => sum + order.balance_amount, 0);

  // Get recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Shree Ganesha Green Leafy Vegetables Management System
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={customers.length.toString()}
          icon={Users}
          description="Active customers"
        />
        <StatCard
          title="Total Orders"
          value={orders.length.toString()}
          icon={ShoppingCart}
          description="All time orders"
        />
        <StatCard
          title="Vegetables"
          value={vegetables.length.toString()}
          icon={Package}
          description="Available items"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toFixed(2)}`}
          icon={TrendingUp}
          description="All time revenue"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentOrdersList orders={recentOrders} />
        <LowStockAlert vegetables={vegetables} />
      </div>

      {pendingPayments > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800">Pending Payments Alert</h3>
          <p className="text-orange-700">
            Total pending payments: ₹{pendingPayments.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
