
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";
import { Order, OrderItem } from "@/types/order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrderFormProps {
  onSave: (order: Order) => void;
  onCancel: () => void;
  customers: Customer[];
  vegetables: Vegetable[];
  initialData?: Order;
  preSelectedCustomerId?: string | null;
}

const OrderForm: React.FC<OrderFormProps> = ({
  onSave,
  onCancel,
  customers,
  vegetables,
  initialData,
  preSelectedCustomerId,
}) => {
  const today = new Date();
  const [date, setDate] = useState<Date>(initialData?.order_date ? new Date(initialData.order_date) : today);
  const [customerId, setCustomerId] = useState<string>(
    initialData?.customer_id || preSelectedCustomerId || ""
  );
  const [items, setItems] = useState<OrderItem[]>(
    initialData?.order_items || vegetables.map(veg => ({ 
      vegetable_id: veg.id, 
      quantity: 0,
      unit_price: veg.price,
      total_price: 0
    }))
  );

  const { toast } = useToast();

  // Set pre-selected customer when component mounts
  useEffect(() => {
    if (preSelectedCustomerId && !initialData) {
      setCustomerId(preSelectedCustomerId);
    }
  }, [preSelectedCustomerId, initialData]);

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
    return items.reduce((sum, item) => {
      const vegetable = vegetables.find(v => v.id === item.vegetable_id);
      return sum + (vegetable ? vegetable.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast({
        variant: "destructive",
        title: "Customer Required",
        description: "Please select a customer for this order",
      });
      return;
    }

    const validItems = items.filter(item => item.quantity > 0);
    
    if (validItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Items Required",
        description: "Please add at least one item to the order",
      });
      return;
    }

    const total = calculateTotal();

    const order: Order = {
      id: initialData?.id || Date.now().toString(),
      order_date: date.toISOString().split('T')[0],
      customer_id: customerId,
      order_items: validItems,
      created_at: initialData?.created_at || new Date().toISOString(),
      total_amount: total,
      payment_status: 'pending',
      paid_amount: 0,
      balance_amount: total,
    };

    onSave(order);

    toast({
      title: initialData ? "Order Updated" : "Order Created",
      description: `Order has been ${initialData ? "updated" : "created"} successfully`,
    });
  };

  const selectedCustomer = customers.find(c => c.id === customerId);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Order" : "New Order"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} {customer.shop_name && `- ${customer.shop_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCustomer && (
            <div className="p-3 bg-secondary rounded-md">
              <h3 className="font-medium">Customer Details</h3>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span> {selectedCustomer.name}
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile:</span> {selectedCustomer.mobile}
                </div>
                {selectedCustomer.shop_name && (
                  <div>
                    <span className="text-muted-foreground">Shop:</span> {selectedCustomer.shop_name}
                  </div>
                )}
                {selectedCustomer.location && (
                  <div>
                    <span className="text-muted-foreground">Location:</span> {selectedCustomer.location}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Items</Label>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vegetable</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vegetables.map((vegetable) => {
                    const item = items.find(i => i.vegetable_id === vegetable.id);
                    const quantity = item ? item.quantity : 0;
                    
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
                            className="w-20 ml-auto"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(vegetable.id, e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-md text-right">
            <p className="font-medium text-lg">
              Total: ₹{calculateTotal().toFixed(2)}
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Order" : "Create Order"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OrderForm;
