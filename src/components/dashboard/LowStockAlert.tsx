
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types/order";
import { Vegetable } from "@/types/vegetable";
import { format } from "date-fns";

interface LowStockAlertProps {
  orders: Order[];
  vegetables: Vegetable[];
  days: number;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ orders, vegetables, days }) => {
  // Get orders from the last X days
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);
  
  const recentOrders = orders.filter(order => {
    const orderDate = new Date(order.order_date);
    return orderDate >= startDate && orderDate <= today;
  });

  // Calculate average consumption for each vegetable
  const vegetableConsumption: Record<string, number> = {};
  
  recentOrders.forEach(order => {
    order.order_items?.forEach(item => {
      if (!vegetableConsumption[item.vegetable_id]) {
        vegetableConsumption[item.vegetable_id] = 0;
      }
      vegetableConsumption[item.vegetable_id] += item.quantity;
    });
  });
  
  // Calculate average daily consumption
  const dailyAverages = Object.entries(vegetableConsumption).map(([id, total]) => {
    const vegetable = vegetables.find(v => v.id === id);
    if (!vegetable) return null;
    
    const dailyAvg = total / days;
    
    return {
      id,
      name: vegetable.name,
      unit: vegetable.unit,
      dailyAverage: dailyAvg,
    };
  }).filter(Boolean);
  
  // Sort by daily average (descending)
  dailyAverages.sort((a, b) => b!.dailyAverage - a!.dailyAverage);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumption Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {dailyAverages.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Based on orders from {format(startDate, "dd/MM/yyyy")} to {format(today, "dd/MM/yyyy")}
            </p>
            <div className="space-y-3">
              {dailyAverages.slice(0, 5).map((item) => (
                <div key={item!.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{item!.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item!.dailyAverage.toFixed(2)} {item!.unit}/day
                    </span>
                  </div>
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (item!.dailyAverage / dailyAverages[0]!.dailyAverage) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
