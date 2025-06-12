
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCustomerByQrCode, useVegetables, useCreateOrder } from "@/hooks/use-supabase-data";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, Plus, Minus, Store, Phone, MapPin } from "lucide-react";
import { OrderItem } from "@/types/order";

interface CartItem {
  vegetable_id: string;
  name: string;
  unit: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

const CustomerOrderApp = () => {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: customer, isLoading: customerLoading, error: customerError } = useCustomerByQrCode(qrCode);
  const { data: vegetables = [], isLoading: vegetablesLoading } = useVegetables();
  const createOrder = useCreateOrder();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToCart = (vegetable: any, quantity: number) => {
    if (quantity <= 0) return;
    
    const existingItemIndex = cart.findIndex(item => item.vegetable_id === vegetable.id);
    const total_price = quantity * vegetable.price;
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity,
        total_price
      };
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        vegetable_id: vegetable.id,
        name: vegetable.name,
        unit: vegetable.unit,
        unit_price: vegetable.price,
        quantity,
        total_price
      }]);
    }
  };

  const updateQuantity = (vegetableId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(vegetableId);
      return;
    }
    
    setCart(cart.map(item => 
      item.vegetable_id === vegetableId 
        ? { ...item, quantity: newQuantity, total_price: newQuantity * item.unit_price }
        : item
    ));
  };

  const removeFromCart = (vegetableId: string) => {
    setCart(cart.filter(item => item.vegetable_id !== vegetableId));
  };

  const getCartItemQuantity = (vegetableId: string) => {
    const item = cart.find(item => item.vegetable_id === vegetableId);
    return item ? item.quantity : 0;
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.total_price, 0);

  const submitOrder = async () => {
    if (!customer || cart.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      const orderItems: Omit<OrderItem, 'id' | 'order_id'>[] = cart.map(item => ({
        vegetable_id: item.vegetable_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const order = {
        customer_id: customer.id,
        order_date: new Date().toISOString().split('T')[0],
        total_amount: totalAmount,
        payment_status: 'pending' as const,
        payment_method: 'cash' as const,
        paid_amount: 0,
        balance_amount: totalAmount
      };

      await createOrder.mutateAsync({ order, items: orderItems });
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order of ₹${totalAmount.toFixed(2)} has been placed. We'll contact you soon.`,
      });
      
      setCart([]);
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (customerLoading || vegetablesLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <Store className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
            <p className="text-gray-600 mb-4">
              The QR code is invalid or the customer account doesn't exist.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Go Green Leafy Vegetables</h1>
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

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Vegetables List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Fresh Vegetables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {vegetables.map((vegetable) => {
                    const cartQuantity = getCartItemQuantity(vegetable.id);
                    return (
                      <div key={vegetable.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">{vegetable.name}</h3>
                            <p className="text-sm text-gray-600">{vegetable.unit}</p>
                          </div>
                          <Badge variant="secondary">
                            ₹{vegetable.price}/{vegetable.unit}
                          </Badge>
                        </div>
                        
                        {cartQuantity > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(vegetable.id, cartQuantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">{cartQuantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(vegetable.id, cartQuantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Qty"
                              min="0"
                              step="0.5"
                              className="w-20"
                              onChange={(e) => {
                                const quantity = parseFloat(e.target.value) || 0;
                                if (quantity > 0) {
                                  addToCart(vegetable, quantity);
                                }
                              }}
                            />
                            <span className="text-sm text-gray-500">{vegetable.unit}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.vegetable_id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            {item.quantity} {item.unit} × ₹{item.unit_price}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">₹{item.total_price.toFixed(2)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.vegetable_id)}
                            className="h-6 w-6 p-0 text-red-500"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    
                    <Button 
                      onClick={submitOrder}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Placing Order..." : "Place Order"}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      We'll contact you to confirm your order and arrange delivery/pickup.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderApp;
