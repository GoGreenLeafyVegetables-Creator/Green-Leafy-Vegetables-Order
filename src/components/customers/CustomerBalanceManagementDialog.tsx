
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IndianRupee, Edit, Check, X } from "lucide-react";
import { Customer } from "@/types/customer";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/use-supabase-data";
import { useUpdateCustomerOldBalance, useUpdateCustomerPayment } from "@/hooks/use-customer-balance";
import { format } from "date-fns";

interface CustomerBalanceManagementDialogProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerBalanceManagementDialog: React.FC<CustomerBalanceManagementDialogProps> = ({
  customer,
  isOpen,
  onClose,
}) => {
  const [oldBalance, setOldBalance] = useState(customer.old_balance?.toString() || "0");
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [tempPayment, setTempPayment] = useState({ amount: 0, method: 'cash' });
  const { toast } = useToast();

  const { data: allOrders = [] } = useOrders();
  const updateOldBalance = useUpdateCustomerOldBalance();
  const updatePayment = useUpdateCustomerPayment();

  const customerOrders = allOrders.filter(order => order.customer_id === customer.id);

  useEffect(() => {
    setOldBalance(customer.old_balance?.toString() || "0");
  }, [customer.old_balance]);

  const handleUpdateOldBalance = async () => {
    const balanceAmount = parseFloat(oldBalance);
    
    if (isNaN(balanceAmount)) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid number for the old balance",
      });
      return;
    }

    try {
      await updateOldBalance.mutateAsync({ customerId: customer.id, oldBalance: balanceAmount });
      toast({
        title: "Old Balance Updated",
        description: `Old balance updated to ₹${balanceAmount.toFixed(2)} successfully`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update old balance. Please try again.",
      });
    }
  };

  const handleEditPayment = (orderId: string, currentAmount: number, currentMethod: string) => {
    setEditingOrder(orderId);
    setTempPayment({ amount: currentAmount, method: currentMethod });
  };

  const handleSavePayment = async (orderId: string, totalAmount: number) => {
    const calculatePaymentStatus = (total: number, paid: number): 'pending' | 'partial' | 'paid' => {
      if (paid === 0) return 'pending';
      if (paid >= total) return 'paid';
      return 'partial';
    };

    try {
      await updatePayment.mutateAsync({
        orderId,
        updates: {
          paid_amount: tempPayment.amount,
          payment_status: calculatePaymentStatus(totalAmount, tempPayment.amount),
          payment_method: tempPayment.method
        }
      });
      
      setEditingOrder(null);
      toast({
        title: "Payment Updated",
        description: "Payment information updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update payment. Please try again.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setTempPayment({ amount: 0, method: 'cash' });
  };

  const totalCurrentBalance = customerOrders.reduce((sum, order) => sum + (order.total_amount - order.paid_amount), 0);
  const totalWithOldBalance = totalCurrentBalance + (customer.old_balance || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Balance Management - {customer.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="old-balance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="old-balance">Old Balance</TabsTrigger>
              <TabsTrigger value="orders">Order Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="old-balance" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm mb-4">
                  <strong>Customer:</strong> {customer.name} ({customer.customer_code})
                  <br />
                  <strong>Mobile:</strong> {customer.mobile}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-white rounded">
                    <div className="text-lg font-semibold text-amber-600">₹{(customer.old_balance || 0).toFixed(2)}</div>
                    <div className="text-xs text-amber-600">Current Old Balance</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="text-lg font-semibold text-blue-600">₹{totalCurrentBalance.toFixed(2)}</div>
                    <div className="text-xs text-blue-600">Current Orders Balance</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className={`text-lg font-semibold ${totalWithOldBalance > 0 ? 'text-red-600' : totalWithOldBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      ₹{totalWithOldBalance.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Total Balance</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old-balance">Update Old Balance Amount (₹)</Label>
                  <Input
                    id="old-balance"
                    type="number"
                    step="0.01"
                    value={oldBalance}
                    onChange={(e) => setOldBalance(e.target.value)}
                    placeholder="Enter old balance amount"
                    className="text-right"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-700">
                    Old balance represents previous dues from before the current billing system. 
                    This amount will be added to current order balances and shown separately in PDF reports.
                  </p>
                </div>

                <Button onClick={handleUpdateOldBalance} disabled={updateOldBalance.isPending}>
                  {updateOldBalance.isPending ? "Updating..." : "Update Old Balance"}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  <strong>Shree Ganesha Green Leafy Vegetables</strong> - Order Payment Management
                </p>
              </div>

              <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{format(new Date(order.order_date), "dd/MM/yyyy")}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {order.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>₹{order.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          {editingOrder === order.id ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={tempPayment.amount}
                              onChange={(e) => setTempPayment(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                              className="w-20"
                            />
                          ) : (
                            `₹${order.paid_amount.toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell className={order.balance_amount > 0 ? 'text-red-600' : order.balance_amount < 0 ? 'text-green-600' : 'text-gray-600'}>
                          ₹{(order.total_amount - (editingOrder === order.id ? tempPayment.amount : order.paid_amount)).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {editingOrder === order.id ? (
                            <Select 
                              value={tempPayment.method} 
                              onValueChange={(value) => setTempPayment(prev => ({ ...prev, method: value }))}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="upi">UPI</SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                                <SelectItem value="adjustment">Adjustment</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="capitalize">{order.payment_method}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            order.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.payment_status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {editingOrder === order.id ? (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSavePayment(order.id, order.total_amount)}
                                disabled={updatePayment.isPending}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditPayment(order.id, order.paid_amount, order.payment_method)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerBalanceManagementDialog;
