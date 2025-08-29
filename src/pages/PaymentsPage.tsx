
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, IndianRupee, Search, Edit, Plus, Trash2 } from "lucide-react";
import { useOrders, useCustomers, useCreatePayment, useDeletePayment } from "@/hooks/use-supabase-data";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import PaymentEditDialog from "@/components/payments/PaymentEditDialog";
import { Payment } from "@/types/order";

const PaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();
  const { toast } = useToast();

  // Get all payments from orders
  const allPayments = orders.flatMap(order => {
    const customer = customers.find(c => c.id === order.customer_id);
    return {
      id: order.id,
      customer_id: order.customer_id,
      customer_name: customer?.name || 'Unknown',
      customer_mobile: customer?.mobile || '',
      order_date: order.order_date,
      total_amount: order.total_amount,
      paid_amount: order.paid_amount,
      balance_amount: order.balance_amount,
      payment_status: order.payment_status,
      payment_method: order.payment_method
    };
  });

  const filteredPayments = allPayments.filter(payment =>
    payment.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.customer_mobile.includes(searchQuery)
  );

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deletePayment.mutateAsync(paymentId);
      toast({
        title: "Payment deleted",
        description: "Payment record has been deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete payment",
      });
    }
  };

  const getStatusBadge = (status: string, balance: number) => {
    if (status === 'paid' || balance <= 0) {
      return <Badge className="bg-green-500">Paid</Badge>;
    } else if (status === 'partial') {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Partial</Badge>;
    }
    return <Badge variant="destructive">Pending</Badge>;
  };

  if (ordersLoading || customersLoading) {
    return <div>Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            Track and manage customer payments and outstanding balances
          </p>
        </div>
        <Button
          onClick={() => setShowPaymentDialog(true)}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{payment.customer_name}</h3>
                    {getStatusBadge(payment.payment_status, payment.balance_amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {payment.customer_mobile}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(payment.order_date), "dd/MM/yyyy")}
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      Total: ₹{payment.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="text-lg font-semibold text-green-600">
                    ₹{payment.paid_amount.toFixed(2)} Paid
                  </div>
                  {payment.balance_amount > 0 && (
                    <div className="text-sm text-red-600">
                      ₹{payment.balance_amount.toFixed(2)} Due
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground uppercase">
                    {payment.payment_method}
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPayment(payment as Payment)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePayment(payment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingPayment && (
        <PaymentEditDialog
          payment={editingPayment}
          isOpen={!!editingPayment}
          onClose={() => setEditingPayment(null)}
          customers={customers}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
