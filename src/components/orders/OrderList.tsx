
import React from "react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";
import { Customer } from "@/types/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrderListProps {
  orders: Order[];
  customers: Customer[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  customers,
  onView,
  onEdit,
  onDelete,
  searchQuery,
  setSearchQuery,
  selectedCustomerId,
  setSelectedCustomerId,
}) => {
  // Filter orders based on search query and selected customer
  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customer_id);
    const customerName = customer?.name || "";
    const date = format(new Date(order.order_date), "PPP");
    const orderNumber = order.id.slice(-8).toUpperCase(); // Last 8 characters as order number
    
    const matchesSearch = 
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCustomerFilter = !selectedCustomerId || selectedCustomerId === "all" || order.customer_id === selectedCustomerId;
    
    return matchesSearch && matchesCustomerFilter;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Order List</CardTitle>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by customer name, date, or order number..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              value={selectedCustomerId}
              onValueChange={setSelectedCustomerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredOrders.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const customer = customers.find(c => c.id === order.customer_id);
                  const orderNumber = order.id.slice(-8).toUpperCase();
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        #{orderNumber}
                      </TableCell>
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(order)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(order)}
                            title="Edit Order"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(order.id)}
                            title="Delete Order"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCustomerId
                ? "No orders match your search criteria"
                : "No orders found. Create your first order!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderList;
