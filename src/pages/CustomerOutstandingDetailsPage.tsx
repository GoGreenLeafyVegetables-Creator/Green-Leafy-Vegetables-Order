
import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrders, useVegetables, useUpdateOrder } from "@/hooks/use-supabase-data";
import { ArrowLeft, Edit, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import PaymentEditDialog from "@/components/payments/PaymentEditDialog";
import { Order } from "@/types/order";
import { useToast } from "@/components/ui/use-toast";

const CustomerOutstandingDetailsPage = () => {
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const customer = location.state?.customer;
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const { data: orders = [] } = useOrders();
  const { data: vegetables = [] } = useVegetables();
  const updateOrder = useUpdateOrder();
  const { toast } = useToast();

  // Filter orders for this customer
  const customerOrders = orders.filter(order => order.customer_id === customerId);
  const outstandingOrders = customerOrders.filter(order => order.balance_amount > 0);
  const paidOrders = customerOrders.filter(order => order.balance_amount <= 0);

  const totalOutstanding = outstandingOrders.reduce((sum, order) => sum + order.balance_amount, 0);
  const totalBusiness = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalPaid = customerOrders.reduce((sum, order) => sum + order.paid_amount, 0);

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
        title: "Payment Updated",
        description: "Payment details have been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment details.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!customer) {
    return (
      <div className="p-6">
        <Button onClick={() => navigate('/outstanding-orders')} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Outstanding Orders
        </Button>
        <div>Customer not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button onClick={() => navigate('/outstanding-orders')} variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Outstanding Orders
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{customer.name} - Order Details</h1>
          <p className="text-muted-foreground">
            Complete order history, payments, and balance management
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">₹{totalOutstanding.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Outstanding</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">₹{totalPaid.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Paid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">₹{totalBusiness.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Business</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{customerOrders.length}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Orders */}
      {outstandingOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Outstanding Orders ({outstandingOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outstandingOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(order.order_date), 'PPP')}
                        </span>
                        <Badge className={getStatusColor(order.payment_status)}>
                          {order.payment_status?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Order ID: {order.id.slice(0, 8)}...
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">₹{order.total_amount.toFixed(2)}</div>
                      <div className="text-sm text-green-600">Paid: ₹{order.paid_amount.toFixed(2)}</div>
                      <div className="text-sm text-red-600 font-bold">Due: ₹{order.balance_amount.toFixed(2)}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingOrder(order)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit Payment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paid Orders */}
      {paidOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Completed Orders ({paidOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paidOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(order.order_date), 'PPP')}
                        </span>
                        <Badge className={getStatusColor(order.payment_status)}>
                          {order.payment_status?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Order ID: {order.id.slice(0, 8)}...
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">₹{order.total_amount.toFixed(2)}</div>
                      <div className="text-sm text-green-600">Paid: ₹{order.paid_amount.toFixed(2)}</div>
                      {order.balance_amount < 0 && (
                        <div className="text-sm text-blue-600">Advance: ₹{Math.abs(order.balance_amount).toFixed(2)}</div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingOrder(order)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit Payment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {editingOrder && (
        <PaymentEditDialog
          order={editingOrder}
          customer={customer}
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handlePaymentUpdate}
        />
      )}
    </div>
  );
};

export default CustomerOutstandingDetailsPage;
