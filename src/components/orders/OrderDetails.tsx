
import React from "react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface OrderDetailsProps {
  order: Order;
  customer: Customer | undefined;
  vegetables: Vegetable[];
  onEdit: (order: Order) => void;
  onClose: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  customer,
  vegetables,
  onEdit,
  onClose,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
        <div className="text-sm text-muted-foreground">
          Created on {format(new Date(order.created_at || order.order_date), "PPP 'at' p")}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Order Information</h3>
            <div className="space-y-1 text-sm">
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Order ID:</span>
                <span>{order.id}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Date:</span>
                <span>{format(new Date(order.order_date), "PPP")}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium">₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {customer && (
            <div>
              <h3 className="font-medium mb-2">Customer Information</h3>
              <div className="space-y-1 text-sm">
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{customer.name}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Mobile:</span>
                  <span>{customer.mobile}</span>
                </div>
                {customer.shop_name && (
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Shop:</span>
                    <span>{customer.shop_name}</span>
                  </div>
                )}
                {customer.location && (
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{customer.location}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-2">Order Items</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_items?.map((item) => {
                  const vegetable = vegetables.find(v => v.id === item.vegetable_id);
                  if (!vegetable) return null;
                  
                  const subtotal = item.total_price;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {vegetable.name}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{vegetable.unit}</TableCell>
                      <TableCell>₹{item.unit_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        ₹{subtotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Total:
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{order.total_amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => onEdit(order)}>
          Edit Order
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderDetails;
