
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types/order";
import { Customer } from "@/types/customer";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface RecentOrdersListProps {
  orders: Order[];
  customers: Customer[];
  onViewOrder: (order: Order) => void;
}

const RecentOrdersList: React.FC<RecentOrdersListProps> = ({ orders, customers, onViewOrder }) => {
  // Get the 5 most recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {recentOrders.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => {
                  const customer = customers.find(c => c.id === order.customer_id);
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        {format(new Date(order.order_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {order.order_items?.length || 0} items
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{order.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No orders yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrdersList;
