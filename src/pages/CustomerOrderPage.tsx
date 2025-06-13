
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCustomers, useVegetables, useCreateOrder } from "@/hooks/use-supabase-data";
import { useToast } from "@/components/ui/use-toast";
import CustomerOrderForm from "@/components/customer-app/CustomerOrderForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types/order";

const CustomerOrderPage = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: vegetables = [], isLoading: vegetablesLoading } = useVegetables();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Find customer by QR code
  const customer = customers.find(c => c.qr_code === qrCode);

  useEffect(() => {
    if (!customersLoading && !customer && qrCode) {
      toast({
        variant: "destructive",
        title: "Invalid QR Code",
        description: "Customer not found for this QR code",
      });
    }
  }, [customersLoading, customer, qrCode, toast]);

  const handleSubmitOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createOrder.mutateAsync(orderData);
      setOrderPlaced(true);
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been submitted and will be processed soon.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to place order. Please try again.",
      });
    }
  };

  if (customersLoading || vegetablesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">🥬</div>
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">🥬</div>
            <CardTitle className="text-red-600">Invalid QR Code</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              The QR code you scanned is not valid or the customer account could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center bg-green-600 text-white">
            <div className="text-4xl mb-4">✅</div>
            <CardTitle className="text-2xl">Order Placed!</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-lg mb-4">
              Thank you, {customer.name}!
            </p>
            <p className="text-muted-foreground mb-4">
              Your order has been successfully submitted. You will be contacted shortly for delivery details.
            </p>
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-sm text-green-700">
                Payment will be collected on delivery
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CustomerOrderForm
      customer={customer}
      vegetables={vegetables}
      onSubmitOrder={handleSubmitOrder}
    />
  );
};

export default CustomerOrderPage;
