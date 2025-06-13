
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { useOrders, useCustomers, useUpdateOrder } from "@/hooks/use-supabase-data";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const PaymentUpdatePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'mixed'>('cash');

  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const updateOrder = useUpdateOrder();
  const { toast } = useToast();

  // Filter orders with outstanding balance
  const filteredOrders = orders.filter((order) => {
    const customer = customers.find(c => c.id === order.customer_id);
    const matchesSearch = !searchQuery || 
      customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCustomer = selectedCustomerId === "all" || order.customer_id === selectedCustomerId;
    const hasBalance = order.balance_amount > 0;
    
    return matchesSearch && matchesCustomer && hasBalance;
  });

  const selectedOrder = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;
  const selectedCustomer = selectedOrder ? customers.find(c => c.id === selectedOrder.customer_id) : null;

  const handlePaymentUpdate = async () => {
    if (!selectedOrder || paymentAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Payment",
        description: "Please select an order and enter a valid payment amount",
      });
      return;
    }

    if (paymentAmount > selectedOrder.balance_amount) {
      toast({
        variant: "destructive",
        title: "Invalid Payment",
        description: "Payment amount cannot exceed the outstanding balance",
      });
      return;
    }

    try {
      const newPaidAmount = selectedOrder.paid_amount + paymentAmount;
      const newBalanceAmount = selectedOrder.total_amount - newPaidAmount;
      const newPaymentStatus = newBalanceAmount <= 0 ? 'paid' : 'partial';

      await updateOrder.mutateAsync({
        id: selectedOrder.id,
        paid_amount: newPaidAmount,
        balance_amount: newBalanceAmount,
        payment_status: newPaymentStatus,
        payment_method: paymentMethod,
      });

      toast({
        title: "Payment Updated",
        description: `Payment of ₹${paymentAmount} has been recorded successfully`,
      });

      setSelectedOrderId(null);
      setPaymentAmount(0);
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
          <h1 className="text-3xl font-bold tracking-tight">Payment Updates</h1>
          <p className="text-muted-foreground">Update customer payments for outstanding orders</p>
        </div>
        <div>Loading payment data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Updates</h1>
        <p className="text-muted-foreground">Update customer payments for outstanding orders</p>
      </div>

      {/* Payment Form */}
      {selectedOrder && selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>Update Payment for {selectedCustomer.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm text-muted-foreground">Order Total</Label>
                <p className="text-lg font-medium">₹{selectedOrder.total_amount.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Already Paid</Label>
                <p className="text-lg font-medium">₹{selectedOrder.paid_amount.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Outstanding Balance</Label>
                <p className="text-lg font-medium text-red-600">₹{selectedOrder.balance_amount.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Payment Amount</Label>
                <Input
                  type="number"
                  min="0"
                  max={selectedOrder.balance_amount}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter payment amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: 'cash' | 'upi' | 'mixed') => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">PhonePe UPI</SelectItem>
                    <SelectItem value="mixed">Mixed (Cash + UPI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handlePaymentUpdate} disabled={paymentAmount <= 0}>
                Update Payment
              </Button>
              <Button variant="outline" onClick={() => setSelectedOrderId(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Orders</CardTitle>
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
          </div>

          {filteredOrders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const customer = customers.find(c => c.id === order.customer_id);
                    
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
                        <TableCell className="text-right font-medium text-red-600">
                          ₹{order.balance_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => setSelectedOrderId(order.id)}
                            disabled={selectedOrderId === order.id}
                          >
                            {selectedOrderId === order.id ? "Selected" : "Update Payment"}
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
                No outstanding orders found
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentUpdatePage;
