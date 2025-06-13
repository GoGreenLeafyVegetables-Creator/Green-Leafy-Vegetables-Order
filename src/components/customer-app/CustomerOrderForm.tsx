
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Vegetable } from "@/types/vegetable";
import { Customer } from "@/types/customer";
import { Order, OrderItem } from "@/types/order";

interface CustomerOrderFormProps {
  customer: Customer;
  vegetables: Vegetable[];
  onSubmitOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => void;
}

const CustomerOrderForm: React.FC<CustomerOrderFormProps> = ({
  customer,
  vegetables,
  onSubmitOrder,
}) => {
  const [items, setItems] = useState<OrderItem[]>(
    vegetables.map(veg => ({
      vegetable_id: veg.id,
      quantity: 0,
      unit_price: veg.price,
      total_price: 0
    }))
  );
  const { toast } = useToast();

  const handleQuantityChange = (vegetableId: string, value: string) => {
    const newQuantity = parseFloat(value) || 0;
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.vegetable_id === vegetableId) {
          const vegetable = vegetables.find(v => v.id === vegetableId);
          const unitPrice = vegetable?.price || 0;
          return {
            ...item,
            quantity: newQuantity,
            unit_price: unitPrice,
            total_price: newQuantity * unitPrice
          };
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter(item => item.quantity > 0);
    
    if (validItems.length === 0) {
      toast({
        variant: "destructive",
        title: "No Items Selected",
        description: "Please add at least one item to your order",
      });
      return;
    }

    const total = calculateTotal();
    const today = new Date();

    const order: Omit<Order, 'id' | 'created_at' | 'updated_at'> = {
      order_date: today.toISOString().split('T')[0],
      customer_id: customer.id,
      order_items: validItems,
      total_amount: total,
      payment_method: 'cash',
      payment_status: 'pending',
      paid_amount: 0,
      balance_amount: total,
    };

    onSubmitOrder(order);
  };

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center bg-green-600 text-white">
            <div className="text-4xl mb-2">🥬</div>
            <CardTitle className="text-2xl">Go Green Leafy Vegetables</CardTitle>
            <p className="text-green-100">Welcome, {customer.name}!</p>
            {customer.shop_name && (
              <p className="text-sm text-green-200">{customer.shop_name}</p>
            )}
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Your Vegetables</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vegetable</TableHead>
                          <TableHead>Price per {vegetables[0]?.unit || 'unit'}</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vegetables.map((vegetable) => {
                          const item = items.find(i => i.vegetable_id === vegetable.id);
                          const quantity = item ? item.quantity : 0;
                          const subtotal = quantity * vegetable.price;
                          
                          return (
                            <TableRow key={vegetable.id}>
                              <TableCell className="font-medium">{vegetable.name}</TableCell>
                              <TableCell>₹{vegetable.price.toFixed(2)}</TableCell>
                              <TableCell>{vegetable.unit}</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  className="w-24 ml-auto"
                                  value={quantity}
                                  onChange={(e) => handleQuantityChange(vegetable.id, e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ₹{subtotal.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{total.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Payment will be collected on delivery
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={total === 0}
                  >
                    Place Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CustomerOrderForm;
