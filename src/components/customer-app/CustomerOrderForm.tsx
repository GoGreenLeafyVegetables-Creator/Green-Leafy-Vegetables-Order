
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";
import { Order, OrderItem } from "@/types/order";
import { ShoppingCart, Plus, Minus, Store, Phone, MapPin, Edit2, Check, X } from "lucide-react";

interface CartItem {
  vegetable_id: string;
  name: string;
  unit: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

interface CustomerOrderFormProps {
  customer: Customer;
  vegetables: Vegetable[];
  onSubmitOrder: (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => void;
}

const CustomerOrderForm: React.FC<CustomerOrderFormProps> = ({
  customer,
  vegetables,
  onSubmitOrder,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const addToCart = (vegetable: Vegetable, quantity: number, customPrice?: number) => {
    if (quantity <= 0) return;
    
    const existingItemIndex = cart.findIndex(item => item.vegetable_id === vegetable.id);
    const unitPrice = customPrice || vegetable.price;
    const total_price = quantity * unitPrice;
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity,
        unit_price: unitPrice,
        total_price
      };
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        vegetable_id: vegetable.id,
        name: vegetable.name,
        unit: vegetable.unit,
        unit_price: unitPrice,
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

  const updatePrice = (vegetableId: string, newPrice: number) => {
    setCart(cart.map(item => 
      item.vegetable_id === vegetableId 
        ? { ...item, unit_price: newPrice, total_price: item.quantity * newPrice }
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

  const getCartItemPrice = (vegetableId: string) => {
    const item = cart.find(item => item.vegetable_id === vegetableId);
    const vegetable = vegetables.find(v => v.id === vegetableId);
    return item ? item.unit_price : vegetable?.price || 0;
  };

  const handlePriceEdit = (vegetableId: string, currentPrice: number) => {
    setEditingPrice(vegetableId);
    setTempPrice(currentPrice);
  };

  const handlePriceUpdate = (vegetableId: string) => {
    updatePrice(vegetableId, tempPrice);
    setEditingPrice(null);
    setTempPrice(0);
  };

  const handlePriceCancelEdit = () => {
    setEditingPrice(null);
    setTempPrice(0);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.total_price, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      const orderItems: Omit<OrderItem, 'id' | 'order_id'>[] = cart.map(item => ({
        vegetable_id: item.vegetable_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'> = {
        customer_id: customer.id,
        order_date: new Date().toISOString().split('T')[0],
        total_amount: totalAmount,
        payment_status: 'pending',
        payment_method: 'cash',
        paid_amount: 0,
        balance_amount: totalAmount,
        order_items: orderItems
      };

      await onSubmitOrder(orderData);
      setCart([]);
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
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
                    const currentPrice = getCartItemPrice(vegetable.id);
                    const isEditingThisPrice = editingPrice === vegetable.id;
                    
                    return (
                      <div key={vegetable.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">{vegetable.name}</h3>
                            <p className="text-sm text-gray-600">{vegetable.unit}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isEditingThisPrice ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(parseFloat(e.target.value) || 0)}
                                  className="w-16 h-6 text-xs"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handlePriceUpdate(vegetable.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handlePriceCancelEdit}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary">
                                  ₹{currentPrice}/{vegetable.unit}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handlePriceEdit(vegetable.id, currentPrice)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
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
                                  addToCart(vegetable, quantity, currentPrice);
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
      </div>
    </div>
  );
};

export default CustomerOrderForm;
