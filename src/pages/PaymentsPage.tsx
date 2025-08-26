
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOrders, useUpdateOrder } from "@/hooks/use-supabase-data";
import { Search, Edit, DollarSign, Calendar, User, Phone } from "lucide-react";
import { format } from "date-fns";
import PaymentEditDialog from "@/components/payments/PaymentEditDialog";
import { Order } from "@/types/order";

const PaymentsPage = () => {
  const { data: orders = [], isLoading } = useOrders();
  const updateOrder = useUpdateOrder();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    const customer = order.customers?.[0];
    const searchLower = searchTerm.toLowerCase();
    return (
      customer?.name?.toLowerCase().includes(searchLower) ||
      customer?.mobile?.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchLower) ||
      order.order_date.includes(searchTerm)
    );
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
    payment_status: 'pending' | 'partial' | 'paid';
    balance_amount: number;
  }) => {
    try {
      await updateOrder.mutateAsync({
        id: orderId,
        paid_amount: updates.paid_amount,
        payment_method: updates.payment_method as 'cash' | 'upi' | 'mixed' | 'adjustment',
        payment_status: updates.payment_status,
        balance_amount: updates.balance_amount
      });
      setEditingOrder(null);
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
        <p className="text-muted-foreground">
          Manage customer payments and order balances
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name, mobile, order ID, or date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => {
          const customer = order.customers?.[0];
          return (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{customer?.name}</span>
                    </div>
                    {customer?.mobile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {customer.mobile}
                      </div>
                    )}
                    {customer?.shop_name && (
                      <div className="text-sm text-muted-foreground">
                        {customer.shop_name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(order.order_date), 'PPP')}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Order ID: {order.id.slice(0, 8)}...
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">₹{order.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Paid: </span>
                      <span className="font-medium">₹{order.paid_amount.toFixed(2)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Balance: </span>
                      <span className={`font-medium ${order.balance_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{order.balance_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Badge className={getStatusColor(order.payment_status)}>
                        {order.payment_status?.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        via {order.payment_method}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingOrder(order)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editingOrder && (
        <PaymentEditDialog
          order={editingOrder}
          onSave={handlePaymentUpdate}
          onCancel={() => setEditingOrder(null)}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
