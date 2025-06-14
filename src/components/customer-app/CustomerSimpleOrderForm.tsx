
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";
import { useCreateOrder } from "@/hooks/use-supabase-data";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, Plus, Minus, Calendar } from "lucide-react";

interface CartItem {
  vegetable_id: string;
  name: string;
  unit: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

interface CustomerSimpleOrderFormProps {
  customer: Customer;
  vegetables: Vegetable[];
}

const CustomerSimpleOrderForm: React.FC<CustomerSimpleOrderFormProps> = ({
  customer,
  vegetables,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const addToCart = (vegetable: Vegetable, quantity: number) => {
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

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Please add items to your cart before placing an order",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const orderItems = cart.map(item => ({
        vegetable_id: item.vegetable_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const orderData = {
        customer_id: customer.id,
        order_date: selectedDate,
        total_amount: totalAmount,
        payment_status: 'pending' as const,
        payment_method: 'cash' as const,
        paid_amount: 0,
        balance_amount: totalAmount
      };

      await createOrder.mutateAsync({ order: orderData, items: orderItems });
      
      toast({
        title: "Order Placed Successfully",
        description: `Your order for ₹${totalAmount.toFixed(2)} has been placed for ${selectedDate}`,
      });
      
      setCart([]);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Order Date Selection */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Order Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Label htmlFor="order-date">Order Date</Label>
              <Input
                id="order-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

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
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Order Date:</span>
                    <span className="text-sm font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Payment will be collected on delivery
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerSimpleOrderForm;
