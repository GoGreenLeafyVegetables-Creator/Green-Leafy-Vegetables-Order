
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarCheck, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Order } from "@/types/order";
import { Vegetable } from "@/types/vegetable";

interface DailyReportViewProps {
  orders: Order[];
  vegetables: Vegetable[];
}

interface DailyReportItem {
  vegetableId: string;
  totalQuantity: number;
}

const DailyReportView: React.FC<DailyReportViewProps> = ({ orders, vegetables }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filter orders by selected date
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.order_date);
    return (
      orderDate.getFullYear() === selectedDate.getFullYear() &&
      orderDate.getMonth() === selectedDate.getMonth() &&
      orderDate.getDate() === selectedDate.getDate()
    );
  });

  // Create a report of total quantities for each vegetable
  const dailyReport: DailyReportItem[] = vegetables.map((vegetable) => {
    let totalQuantity = 0;

    filteredOrders.forEach((order) => {
      if (order.order_items) {
        order.order_items.forEach((item) => {
          if (item.vegetable_id === vegetable.id) {
            totalQuantity += item.quantity;
          }
        });
      }
    });

    return {
      vegetableId: vegetable.id,
      totalQuantity,
    };
  }).filter((item) => item.totalQuantity > 0);

  const downloadReport = () => {
    // Create CSV content
    let csvContent = "Vegetable Name,Total Quantity,Unit\n";
    
    dailyReport.forEach((item) => {
      const vegetable = vegetables.find((v) => v.id === item.vegetableId);
      if (vegetable) {
        csvContent += `"${vegetable.name}",${item.totalQuantity},${vegetable.unit}\n`;
      }
    });
    
    // Create download link
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daily_Report_${format(selectedDate, "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
        <CardTitle>Daily Summary Report</CardTitle>
        <div className="flex flex-col md:flex-row items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarCheck className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            onClick={downloadReport} 
            disabled={dailyReport.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {dailyReport.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vegetable</TableHead>
                  <TableHead className="text-right">Total Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyReport.map((item) => {
                  const vegetable = vegetables.find((v) => v.id === item.vegetableId);
                  if (!vegetable) return null;
                  
                  return (
                    <TableRow key={vegetable.id}>
                      <TableCell className="font-medium">{vegetable.name}</TableCell>
                      <TableCell className="text-right">{item.totalQuantity}</TableCell>
                      <TableCell>{vegetable.unit}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">
              No orders found for {format(selectedDate, "PPP")}
            </p>
            <p className="text-sm text-muted-foreground">
              Try selecting a different date or create new orders
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyReportView;
