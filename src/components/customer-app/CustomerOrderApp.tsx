import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers, useVegetables, useCreateCustomerOrder } from "@/hooks/use-supabase-data";
import { useToast } from "@/components/ui/use-toast";
import CustomerOrderForm from "./CustomerOrderForm";
import { Store, Phone, MapPin } from "lucide-react";
import { Order } from "@/types/order";

const CustomerOrderApp = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: vegetables = [], isLoading: vegetablesLoading } = useVegetables();
  const createOrder = useCreateCustomerOrder();
  const { toast } = useToast();

  if (customersLoading || vegetablesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer information...</p>
        </div>
      </div>
    );
  }

  const customer = customers.find(c => c.qr_code === qrCode);

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Customer Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              Sorry, we couldn't find a customer with this QR code. Please contact Go Green Leafy Vegetables for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOrderSubmit = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createOrder.mutateAsync(orderData);

      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been submitted and will be processed soon.",
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-2">
            <img 
              src="/lovable-uploads/8fa965fb-6405-4e65-ba32-8efd8d8ef4ed.png" 
              alt="Lord Ganesha - Go Green Leafy Vegetables Logo" 
              className="h-8 w-8 mr-3"
            />
            <h1 className="text-2xl font-bold">Go Green Leafy Vegetables</h1>
          </div>
          <div className="bg-green-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Store className="h-4 w-4" />
              <span className="font-medium">{customer.name}</span>
            </div>
            {customer.shop_name && (
              <div className="text-green-100 text-sm mb-1">{customer.shop_name}</div>
            )}
            <div className="flex items-center gap-4 text-green-100 text-sm">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {customer.mobile}
              </div>
              {customer.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {customer.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <div className="max-w-4xl mx-auto p-4">
        <CustomerOrderForm
          customer={customer}
          vegetables={vegetables}
          onSubmitOrder={handleOrderSubmit}
        />
      </div>
    </div>
  );
};

export default CustomerOrderApp;
