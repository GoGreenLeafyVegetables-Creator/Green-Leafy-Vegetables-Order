
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Order } from "@/types/order";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";

interface CustomerReportViewProps {
  orders: Order[];
  customers: Customer[];
  vegetables: Vegetable[];
}

const CustomerReportView: React.FC<CustomerReportViewProps> = ({ orders, customers, vegetables }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");

  // Filter orders by selected customer
  const customerOrders = orders.filter((order) => 
    selectedCustomerId === "all" || order.customer_id === selectedCustomerId
  ).sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

  const downloadReport = () => {
    // Create CSV content
    let csvContent = "Order Date,Vegetable,Quantity,Unit,Price,Subtotal\n";
    
    customerOrders.forEach((order) => {
      const orderDate = format(new Date(order.order_date), "yyyy-MM-dd");
      
      if (order.order_items) {
        order.order_items.forEach((item) => {
          const vegetable = vegetables.find((v) => v.id === item.vegetable_id);
          if (vegetable) {
            const subtotal = item.unit_price * item.quantity;
            csvContent += `${orderDate},"${vegetable.name}",${item.quantity},${vegetable.unit},${item.unit_price.toFixed(2)},${subtotal.toFixed(2)}\n`;
          }
        });
      }
    });
    
    // Create download link
    const customer = customers.find(c => c.id === selectedCustomerId);
    const fileName = customer 
      ? `Customer_Report_${customer.name.replace(/\s+/g, '_')}.csv`
      : 'All_Customers_Report.csv';
    
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group by order
  const groupedByOrder = true;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
        <CardTitle>Customer Orders Report</CardTitle>
        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="w-full md:w-64">
            <Select
              value={selectedCustomerId}
              onValueChange={setSelectedCustomerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
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
          
          <Button 
            variant="outline" 
            onClick={downloadReport} 
            disabled={customerOrders.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {customerOrders.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Customer
                    </div>
                  </TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerOrders.map((order) => {
                  const customer = customers.find(c => c.id === order.customer_id);
                  
                  return (
                    <React.Fragment key={order.id}>
                      <TableRow>
                        <TableCell>{format(new Date(order.order_date), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{customer?.name || "Unknown"}</TableCell>
                        <TableCell>{order.order_items?.length || 0} items</TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{order.total_amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      {groupedByOrder && order.order_items && (
                        <TableRow>
                          <TableCell colSpan={4} className="p-0">
                            <div className="pl-6 pr-2 py-2 bg-muted/40">
                              <Table>
                                <TableBody>
                                  {order.order_items.map((item, idx) => {
                                    const vegetable = vegetables.find(v => v.id === item.vegetable_id);
                                    if (!vegetable) return null;
                                    
                                    const subtotal = item.unit_price * item.quantity;
                                    
                                    return (
                                      <TableRow key={`${order.id}-${idx}`} className="border-b-0">
                                        <TableCell className="pl-0">{vegetable.name}</TableCell>
                                        <TableCell className="text-center">{item.quantity} {vegetable.unit}</TableCell>
                                        <TableCell>₹{item.unit_price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">₹{subtotal.toFixed(2)}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">
              {selectedCustomerId !== "all"
                ? "No orders found for the selected customer"
                : "No orders found. Create your first order!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerReportView;
