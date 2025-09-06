import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Package, IndianRupee, Phone, MapPin, Store, ShoppingCart } from "lucide-react";

const CustomerPublicPage = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const navigate = useNavigate();

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ['customer-public', qrCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('qr_code', qrCode!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!qrCode
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['customer-public-analytics', customer?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customer!.id)
        .order('order_date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      
      const yearlyTotal = data
        .filter(order => new Date(order.order_date).getFullYear() === currentYear)
        .reduce((sum, order) => sum + order.total_amount, 0);
      
      const monthlyTotal = data
        .filter(order => {
          const orderDate = new Date(order.order_date);
          return orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth;
        })
        .reduce((sum, order) => sum + order.total_amount, 0);
      
      const totalBalance = data.reduce((sum, order) => sum + order.balance_amount, 0);
      
      return {
        recentOrders: data,
        yearlyTotal,
        monthlyTotal,
        totalBalance,
        totalOrders: data.length
      };
    },
    enabled: !!customer?.id
  });

  if (customerLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div>Loading customer information...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Customer Not Found</h1>
            <p>The QR code you scanned is not valid or the customer doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (balance: number) => {
    if (balance === 0) return <Badge className="bg-green-500">No Dues</Badge>;
    if (balance > 0) return <Badge variant="destructive">₹{balance.toFixed(2)} Due</Badge>;
    return <Badge className="bg-blue-500">₹{Math.abs(balance).toFixed(2)} Advance</Badge>;
  };

  const handlePlaceOrder = () => {
    navigate(`/simple-order/${qrCode}`);
  };

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-green-600 text-white">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <img 
                src="/lovable-uploads/7d90b24c-ea23-4583-821b-cd6b4aa466f9.png" 
                alt="Lord Ganesha - Go Green Leafy Vegetables Logo" 
                className="h-12 w-12 mr-3"
              />
              <CardTitle className="text-2xl">GO GREEN LEAFY VEGETABLES</CardTitle>
            </div>
            <p className="text-green-100">Customer Dashboard</p>
          </CardHeader>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{customer.name}</CardTitle>
              <Button 
                onClick={handlePlaceOrder}
                className="bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Place New Order
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.mobile}</span>
              </div>
              {customer.shop_name && (
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.shop_name}</span>
                </div>
              )}
              {customer.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.location}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Order Action */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="text-center p-6">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold mb-2">Need to Order?</h3>
            <p className="text-muted-foreground mb-4">
              Click below to place your vegetable order quickly and easily
            </p>
            <Button 
              onClick={handlePlaceOrder}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Place Order Now
            </Button>
          </CardContent>
        </Card>

        {/* Analytics */}
        {analyticsLoading ? (
          <Card>
            <CardContent className="text-center p-8">
              Loading business summary...
            </CardContent>
          </Card>
        ) : analytics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="text-center p-6">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-800">₹{analytics.monthlyTotal.toFixed(2)}</div>
                  <div className="text-sm text-blue-600">This Month</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="text-center p-6">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-800">₹{analytics.yearlyTotal.toFixed(2)}</div>
                  <div className="text-sm text-green-600">This Year</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="text-center p-6">
                  <Package className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-800">{analytics.totalOrders}</div>
                  <div className="text-sm text-purple-600">Total Orders</div>
                </CardContent>
              </Card>
            </div>

            {/* Balance Status */}
            <Card>
              <CardContent className="text-center p-6">
                <IndianRupee className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="mb-2">
                  {getStatusBadge(analytics.totalBalance)}
                </div>
                <div className="text-sm text-muted-foreground">Account Balance Status</div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recentOrders.map((order: any) => (
                      <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            {new Date(order.order_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Order #SGLV-{order.id.slice(-4)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₹{order.total_amount.toFixed(2)}</div>
                          <Badge 
                            variant={order.payment_status === 'paid' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {order.payment_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No orders found
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}

        {/* Footer */}
        <Card className="bg-gray-100">
          <CardContent className="text-center p-4">
            <p className="text-sm text-muted-foreground">
              Generated by GO GREEN LEAFY VEGETABLES Management System
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerPublicPage;
