
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarCheck, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";
import { Order, OrderItem } from "@/types/order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrderFormUpdateProps {
  onSave: (order: Order) => void;
  onCancel: () => void;
  customers: Customer[];
  vegetables: Vegetable[];
  initialData?: Order;
  preSelectedCustomerId?: string | null;
}

const OrderFormUpdate: React.FC<OrderFormUpdateProps> = ({
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
  const [items, setItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'mixed' | 'adjustment'>(
    initialData?.payment_method || 'cash'
  );
  const [paidAmount, setPaidAmount] = useState<number>(initialData?.paid_amount || 0);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const { toast } = useToast();

  // Initialize items when vegetables are loaded
  useEffect(() => {
    if (vegetables.length > 0 && !isInitialized) {
      console.log('Initializing items with vegetables:', vegetables.length);
      console.log('Initial data order items:', initialData?.order_items);
      
      const newItems = vegetables.map(veg => {
        // Check if there's existing data for this vegetable
        const existingItem = initialData?.order_items?.find(item => item.vegetable_id === veg.id);
        console.log(`Vegetable ${veg.name}: existing item:`, existingItem);
        
        if (existingItem) {
          return {
            id: existingItem.id,
            order_id: existingItem.order_id,
            vegetable_id: veg.id,
            quantity: existingItem.quantity,
            unit_price: existingItem.unit_price,
            total_price: existingItem.total_price
          } as OrderItem;
        }
        return {
          vegetable_id: veg.id,
          quantity: 0,
          unit_price: veg.price,
          total_price: 0
        } as OrderItem;
      });
      
      console.log('Setting items:', newItems);
      setItems(newItems);
      setIsInitialized(true);
    }
  }, [vegetables, initialData, isInitialized]);

  // Set pre-selected customer when component mounts
  useEffect(() => {
    if (preSelectedCustomerId && !initialData) {
      console.log('Setting pre-selected customer:', preSelectedCustomerId);
      setCustomerId(preSelectedCustomerId);
    }
  }, [preSelectedCustomerId, initialData]);

  const handleQuantityChange = (vegetableId: string, value: string) => {
    const newQuantity = parseFloat(value) || 0;
    console.log('Updating quantity for vegetable:', vegetableId, 'New quantity:', newQuantity);
    
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.vegetable_id === vegetableId) {
          const newTotal = newQuantity * item.unit_price;
          console.log('New total for item:', newTotal);
          return { 
            ...item, 
            quantity: newQuantity,
            total_price: newTotal
          };
        }
        return item;
      })
    );
  };

  const handlePriceEdit = (vegetableId: string, currentPrice: number) => {
    setEditingPrice(vegetableId);
    setTempPrice(currentPrice);
  };

  const handlePriceUpdate = (vegetableId: string) => {
    console.log('Updating price for vegetable:', vegetableId, 'New price:', tempPrice);
    
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.vegetable_id === vegetableId) {
          return { 
            ...item, 
            unit_price: tempPrice,
            total_price: item.quantity * tempPrice
          };
        }
        return item;
      })
    );
    setEditingPrice(null);
    setTempPrice(0);
  };

  const handlePriceCancelEdit = () => {
    setEditingPrice(null);
    setTempPrice(0);
  };

  const calculateTotal = () => {
    const total = items.reduce((sum, item) => sum + item.total_price, 0);
    console.log('Calculated total:', total);
    return total;
  };

  const calculatePaymentStatus = (total: number, paid: number): 'pending' | 'partial' | 'paid' => {
    if (paid === 0) return 'pending';
    if (paid >= total) return 'paid';
    return 'partial';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting order form');

    if (!customerId) {
      toast({
        variant: "destructive",
        title: "Customer Required",
        description: "Please select a customer for this order",
      });
      return;
    }

    const validItems = items.filter(item => item.quantity > 0);
    console.log('Valid items:', validItems);
    
    if (validItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Items Required",
        description: "Please add at least one item to the order",
      });
      return;
    }

    const total = calculateTotal();

    if (paidAmount > total) {
      toast({
        variant: "destructive",
        title: "Invalid Payment",
        description: "Paid amount cannot exceed total amount",
      });
      return;
    }

    // Prepare order data
    const orderData: Order = {
      id: initialData?.id || '',
      order_date: date.toISOString().split('T')[0],
      customer_id: customerId,
      order_items: validItems,
      created_at: initialData?.created_at,
      updated_at: initialData?.updated_at,
      total_amount: total,
      payment_method: paymentMethod,
      payment_status: calculatePaymentStatus(total, paidAmount),
      paid_amount: paidAmount,
      balance_amount: total - paidAmount,
    };

    console.log('Order data to save:', orderData);
    onSave(orderData);
  };

  const selectedCustomer = customers.find(c => c.id === customerId);
  const total = calculateTotal();

  // Show loading state if not initialized
  if (!isInitialized) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">Loading order form...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Order - Shree Ganesha Green Leafy Vegetables" : "New Order - Shree Ganesha Green Leafy Vegetables"}
        </CardTitle>
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
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vegetables.map((vegetable) => {
                    const item = items.find(i => i.vegetable_id === vegetable.id);
                    const quantity = item ? item.quantity : 0;
                    const unitPrice = item ? item.unit_price : vegetable.price;
                    const isEditingThisPrice = editingPrice === vegetable.id;
                    
                    return (
                      <TableRow key={vegetable.id}>
                        <TableCell className="font-medium">{vegetable.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isEditingThisPrice ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(parseFloat(e.target.value) || 0)}
                                  className="w-20"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handlePriceUpdate(vegetable.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={handlePriceCancelEdit}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>₹{unitPrice.toFixed(2)}</span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handlePriceEdit(vegetable.id, unitPrice)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
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
                        <TableCell className="text-right">
                          ₹{(quantity * unitPrice).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium">Payment Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: 'cash' | 'upi' | 'mixed' | 'adjustment') => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">PhonePe UPI</SelectItem>
                    <SelectItem value="mixed">Mixed (Cash + UPI)</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Paid Amount</Label>
                <Input
                  type="number"
                  min="0"
                  max={total}
                  step="0.01"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter paid amount"
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Balance: ₹{(total - paidAmount).toFixed(2)}
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-md text-right">
            <p className="font-medium text-lg">
              Total: ₹{total.toFixed(2)}
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

export default OrderFormUpdate;
