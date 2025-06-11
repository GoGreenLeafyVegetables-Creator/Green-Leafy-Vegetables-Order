
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";
import { Order } from "@/types/order";

interface ExportDataProps {
  customers: Customer[];
  vegetables: Vegetable[];
  orders: Order[];
}

const ExportData: React.FC<ExportDataProps> = ({ customers, vegetables, orders }) => {
  const exportCustomers = () => {
    const csvContent = [
      ["ID", "Name", "Mobile", "Shop Name", "Location"].join(","),
      ...customers.map(customer => 
        [
          customer.id,
          `"${customer.name}"`,
          `"${customer.mobile}"`,
          `"${customer.shopName || ""}"`,
          `"${customer.location || ""}"`
        ].join(",")
      )
    ].join("\n");
    
    downloadCSV(csvContent, "Customers_Export.csv");
  };

  const exportVegetables = () => {
    const csvContent = [
      ["ID", "Name", "Price", "Unit"].join(","),
      ...vegetables.map(vegetable => 
        [
          vegetable.id,
          `"${vegetable.name}"`,
          vegetable.price,
          vegetable.unit
        ].join(",")
      )
    ].join("\n");
    
    downloadCSV(csvContent, "Vegetables_Export.csv");
  };

  const exportOrders = () => {
    // Main orders data
    const ordersCSV = [
      ["Order ID", "Date", "Customer ID", "Total", "Timestamp"].join(","),
      ...orders.map(order => 
        [
          order.id,
          new Date(order.date).toISOString().split('T')[0],
          order.customerId,
          order.total.toFixed(2),
          new Date(order.timestamp).toISOString()
        ].join(",")
      )
    ].join("\n");
    
    // Order items data
    const orderItemsCSV = [
      ["Order ID", "Vegetable ID", "Quantity"].join(","),
      ...orders.flatMap(order => 
        order.items.map(item => 
          [
            order.id,
            item.vegetableId,
            item.quantity
          ].join(",")
        )
      )
    ].join("\n");
    
    downloadCSV(ordersCSV, "Orders_Export.csv");
    downloadCSV(orderItemsCSV, "OrderItems_Export.csv");
  };

  const exportAllData = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    
    // Create a ZIP file containing all exports
    // Since we can't create ZIP files directly in the browser without additional libraries,
    // we'll export each file individually with a timestamp prefix
    
    exportCustomers();
    exportVegetables();
    exportOrders();
  };

  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Export your data to CSV format for backup or analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Button onClick={exportCustomers} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Download className="h-5 w-5" />
          <span>Export Customers</span>
          <span className="text-xs text-muted-foreground">({customers.length} customers)</span>
        </Button>
        
        <Button onClick={exportVegetables} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Download className="h-5 w-5" />
          <span>Export Vegetables</span>
          <span className="text-xs text-muted-foreground">({vegetables.length} vegetables)</span>
        </Button>
        
        <Button onClick={exportOrders} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Download className="h-5 w-5" />
          <span>Export Orders</span>
          <span className="text-xs text-muted-foreground">({orders.length} orders)</span>
        </Button>
        
        <Button onClick={exportAllData} className="h-auto py-4 flex flex-col items-center gap-2">
          <Download className="h-5 w-5" />
          <span>Export All Data</span>
          <span className="text-xs">Complete backup</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportData;
