
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus } from "lucide-react";
import { useCustomers, useOrders, useCreateOrder } from "@/hooks/use-supabase-data";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const CustomerBalancePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [balanceAmount, setBalanceAmount] = useState<number>(0);
  const [balanceType, setBalanceType] = useState<'outstanding' | 'advance'>('outstanding');
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  // Calculate customer balances
  const customerBalances = customers.map(customer => {
    const customerOrders = orders.filter(order => order.customer_id === customer.id);
    const totalOutstanding = customerOrders.reduce((sum, order) => sum + Math.max(0, order.balance_amount), 0);
    const totalAdvance = customerOrders.reduce((sum, order) => sum + Math.abs(Math.min(0, order.balance_amount)), 0);
    const netBalance = totalOutstanding - totalAdvance;
    
    return {
      ...customer,
      totalOutstanding,
      totalAdvance,
      netBalance,
      orderCount: customerOrders.length
    };
  });

  // Filter customers based on search
  const filteredCustomers = customerBalances.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.mobile.includes(searchQuery)
  );

  const handleAddBalance = async () => {
    if (!selectedCustomerId || balanceAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please select a customer and enter a valid amount",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a balance adjustment order
      const adjustmentAmount = balanceType === 'outstanding' ? balanceAmount : -balanceAmount;
      
      const orderData = {
        customer_id: selectedCustomerId,
        order_date: new Date().toISOString().split('T')[0],
        total_amount: balanceAmount,
        payment_status: balanceType === 'outstanding' ? 'pending' as const : 'paid' as const,
        payment_method: 'adjustment' as const,
        paid_amount: balanceType === 'advance' ? balanceAmount : 0,
        balance_amount: adjustmentAmount
      };

      // Create order with empty items array for balance adjustment
      await createOrder.mutateAsync({ order: orderData, items: [] });

      toast({
        title: "Balance Updated",
        description: `${balanceType === 'outstanding' ? 'Outstanding' : 'Advance'} balance of ₹${balanceAmount} has been added`,
      });

      // Reset form
      setSelectedCustomerId("");
      setBalanceAmount(0);
      setNotes("");
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update customer balance",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (customersLoading || ordersLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Balance Management</h1>
          <p className="text-muted-foreground">Manage customer outstanding balances and advance payments</p>
        </div>
        <div>Loading customer data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Balance Management</h1>
        <p className="text-muted-foreground">Manage customer outstanding balances and advance payments</p>
      </div>

      {/* Add Balance Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Customer Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Customer</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} {customer.shop_name && `- ${customer.shop_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Balance Type</Label>
              <Select value={balanceType} onValueChange={(value: 'outstanding' | 'advance') => setBalanceType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outstanding">Outstanding (Customer Owes)</SelectItem>
                  <SelectItem value="advance">Advance (Customer Paid Extra)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this balance adjustment"
              />
            </div>
          </div>
          <Button 
            onClick={handleAddBalance} 
            disabled={isSubmitting || !selectedCustomerId || balanceAmount <= 0}
            className="w-full md:w-auto"
          >
            {isSubmitting ? "Adding Balance..." : "Add Balance"}
          </Button>
        </CardContent>
      </Card>

      {/* Customer Balances List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Balances</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right">Advance</TableHead>
                    <TableHead className="text-right">Net Balance</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{customer.name}</div>
                          {customer.shop_name && (
                            <div className="text-xs text-muted-foreground">{customer.shop_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{customer.mobile}</TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {customer.totalOutstanding > 0 ? `₹${customer.totalOutstanding.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {customer.totalAdvance > 0 ? `₹${customer.totalAdvance.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        customer.netBalance > 0 ? 'text-red-600' : 
                        customer.netBalance < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {customer.netBalance === 0 ? 'Settled' : 
                         customer.netBalance > 0 ? `₹${customer.netBalance.toFixed(2)} Due` :
                         `₹${Math.abs(customer.netBalance).toFixed(2)} Advance`}
                      </TableCell>
                      <TableCell className="text-center">{customer.orderCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No customers match your search" : "No customers found"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerBalancePage;
