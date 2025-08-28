
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Plus, DollarSign } from "lucide-react";
import { useCustomers, useOrders, usePayments, useDeleteOrder, useUpdateOrder } from "@/hooks/use-supabase-data";
import { format } from "date-fns";
import PaymentEditDialog from "@/components/payments/PaymentEditDialog";
import { Order } from "@/types/order";
import { useToast } from "@/components/ui/use-toast";

const CustomerDetailsPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: customers = [] } = useCustomers();
  const { data: orders = [] } = useOrders();
  const { data: payments = [] } = usePayments();
  const deleteOrder = useDeleteOrder();
  const updateOrder = useUpdateOrder();
  
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const customer = customers.find(c => c.id === customerId);
  const customerOrders = orders.filter(order => order.customer_id === customerId);
  const customerPayments = payments.filter(payment => payment.customer_id === customerId);

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Customer Not Found</h1>
        </div>
      </div>
    );
  }

  const totalBalance = customerOrders.reduce((sum, order) => sum + order.balance_amount, 0);
  const totalBusiness = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalPaid = customerOrders.reduce((sum, order) => sum + order.paid_amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await deleteOrder.mutateAsync(orderId);
        toast({
          title: "Order deleted",
          description: "Order has been deleted successfully",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete order",
        });
      }
    }
  };

  const handlePaymentUpdate = async (orderId: string, updates: {
    paid_amount: number;
    payment_method: string;
    payment_status: string;
  }) => {
    try {
      const order = customerOrders.find(o => o.id === orderId);
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
        description: "Order payment has been updated successfully",
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
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
          <p className="text-muted-foreground">Complete customer details and transaction history</p>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mobile</p>
              <p className="text-lg">{customer.mobile}</p>
            </div>
            {customer.shop_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shop</p>
                <p className="text-lg">{customer.shop_name}</p>
              </div>
            )}
            {customer.location && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-lg">{customer.location}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Business</p>
                <p className="text-2xl font-bold">₹{totalBusiness.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">₹{totalPaid.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Balance</p>
                <p className={`text-2xl font-bold ${totalBalance > 0 ? 'text-red-600' : totalBalance < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                  ₹{totalBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-purple-600">{customerOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders found for this customer.</p>
            ) : (
              customerOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">Order #{order.id.slice(0, 8)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.order_date), 'PPP')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingOrder(order)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total: </span>
                      ₹{order.total_amount.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Paid: </span>
                      ₹{order.paid_amount.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Balance: </span>
                      <span className={order.balance_amount > 0 ? 'text-red-600' : order.balance_amount < 0 ? 'text-blue-600' : 'text-green-600'}>
                        ₹{order.balance_amount.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <Badge className={getStatusColor(order.payment_status)}>
                        {order.payment_status?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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

export default CustomerDetailsPage;
