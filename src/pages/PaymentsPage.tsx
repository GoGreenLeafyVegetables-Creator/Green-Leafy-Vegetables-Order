
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit } from "lucide-react";
import { useOrders, useCustomers, useUpdateOrder } from "@/hooks/use-supabase-data";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import PaymentEditDialog from "@/components/payments/PaymentEditDialog";
import { Order } from "@/types/order";

const PaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const updateOrder = useUpdateOrder();
  const { toast } = useToast();

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order) => {
    const customer = customers.find(c => c.id === order.customer_id);
    const matchesSearch = !searchQuery || 
      customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCustomer = selectedCustomerId === "all" || order.customer_id === selectedCustomerId;
    
    let matchesFilter = true;
    if (filterType === "pending") {
      matchesFilter = order.balance_amount > 0;
    } else if (filterType === "paid") {
      matchesFilter = order.balance_amount <= 0;
    } else if (filterType === "advance") {
      matchesFilter = order.balance_amount < 0;
    }
    
    return matchesSearch && matchesCustomer && matchesFilter;
  });

  // Calculate totals
  const totalOutstanding = orders.reduce((sum, order) => sum + Math.max(0, order.balance_amount), 0);
  const totalAdvance = orders.reduce((sum, order) => sum + Math.abs(Math.min(0, order.balance_amount)), 0);
  const totalPaid = orders.reduce((sum, order) => sum + order.paid_amount, 0);

  const handleEditPayment = (order: Order) => {
    setEditingOrder(order);
  };

  const handleSavePayment = async (orderId: string, updates: { paid_amount: number; payment_status: string; payment_method: string }) => {
    try {
      const balanceAmount = filteredOrders.find(o => o.id === orderId)?.total_amount! - updates.paid_amount;
      
      await updateOrder.mutateAsync({
        id: orderId,
        ...updates,
        balance_amount: balanceAmount,
      });

      toast({
        title: "Payment Updated",
        description: "Payment has been updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment",
      });
    }
  };

  if (ordersLoading || customersLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            Track payments and outstanding balances
          </p>
        </div>
        <div>Loading payment data...</div>
      </div>
    );
  }

  const editingCustomer = editingOrder ? customers.find(c => c.id === editingOrder.customer_id) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
        <p className="text-muted-foreground">
          Track payments and outstanding balances
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalOutstanding.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Advance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalAdvance.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by customer or order ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Outstanding</SelectItem>
                <SelectItem value="paid">Fully Paid</SelectItem>
                <SelectItem value="advance">Advance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredOrders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Paid Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const customer = customers.find(c => c.id === order.customer_id);
                    const balanceColor = order.balance_amount > 0 ? 'text-red-600' : 
                                       order.balance_amount < 0 ? 'text-green-600' : 'text-gray-600';
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          {format(new Date(order.order_date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div>{customer?.name || "Unknown"}</div>
                            {customer?.shop_name && (
                              <div className="text-xs text-muted-foreground">{customer.shop_name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">₹{order.total_amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{order.paid_amount.toFixed(2)}</TableCell>
                        <TableCell className={`text-right font-medium ${balanceColor}`}>
                          {order.balance_amount > 0 && `₹${order.balance_amount.toFixed(2)}`}
                          {order.balance_amount < 0 && `₹${Math.abs(order.balance_amount).toFixed(2)} (Advance)`}
                          {order.balance_amount === 0 && "Paid"}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            order.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.payment_status === 'paid' ? 'Paid' :
                             order.payment_status === 'partial' ? 'Partial' : 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPayment(order)}
                            title="Edit Payment"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Payment</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">
                No payment records match your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentEditDialog
        order={editingOrder}
        customer={editingCustomer || null}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={handleSavePayment}
      />
    </div>
  );
};

export default PaymentsPage;
