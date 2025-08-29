
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit2, Search, Filter } from "lucide-react";
import { useCustomers, useOrders, useUpdateOrder } from "@/hooks/use-supabase-data";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import PaymentEditDialog from "@/components/payments/PaymentEditDialog";
import { Order } from "@/types/order";

const PaymentsPage = () => {
  const { data: customers = [] } = useCustomers();
  const { data: orders = [] } = useOrders();
  const updateOrder = useUpdateOrder();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Get all orders with payment information
  const allPayments = orders.map(order => {
    const customer = customers.find(c => c.id === order.customer_id);
    return {
      ...order,
      customer
    };
  });

  // Filter payments based on search and status
  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = payment.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.payment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePaymentUpdate = async (orderId: string, updates: {
    paid_amount: number;
    payment_method: string;
    payment_status: string;
  }) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const balance_amount = order.total_amount - updates.paid_amount;

      await updateOrder.mutateAsync({
        id: orderId,
        paid_amount: updates.paid_amount,
        payment_method: updates.payment_method as 'cash' | 'upi' | 'mixed' | 'adjustment',
        payment_status: updates.payment_status as 'pending' | 'partial' | 'paid',
        balance_amount: balance_amount
      });
      
      setEditingOrder(null);
      toast({
        title: "Payment updated",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
        <p className="text-muted-foreground">
          Manage and track all customer payments
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search payments</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by customer name or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="status-filter" className="sr-only">Filter by status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.customer?.name || 'Unknown Customer'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.order_date), "PPP")}
                      </TableCell>
                      <TableCell>
                        ₹{payment.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-green-600">
                        ₹{payment.paid_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className={payment.balance_amount > 0 ? "text-red-600" : payment.balance_amount < 0 ? "text-blue-600" : "text-green-600"}>
                        ₹{payment.balance_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.payment_status)}>
                          {payment.payment_status?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.payment_method || 'cash'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingOrder(payment)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingOrder && (
        <PaymentEditDialog
          order={editingOrder}
          customer={editingOrder.customer || null}
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handlePaymentUpdate}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
