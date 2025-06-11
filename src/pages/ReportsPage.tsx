
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DailyReportView from "@/components/reports/DailyReportView";
import CustomerReportView from "@/components/reports/CustomerReportView";
import ExportData from "@/components/reports/ExportData";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Order } from "@/types/order";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const [orders] = useLocalStorage<Order[]>("orders", []);
  const [customers] = useLocalStorage<Customer[]>("customers", []);
  const [vegetables] = useLocalStorage<Vegetable[]>("vegetables", []);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      </div>
      
      <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="daily">Daily Summary</TabsTrigger>
          <TabsTrigger value="customer">Customer Report</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          <DailyReportView 
            orders={orders}
            vegetables={vegetables}
          />
        </TabsContent>
        
        <TabsContent value="customer">
          <CustomerReportView 
            orders={orders}
            customers={customers}
            vegetables={vegetables}
          />
        </TabsContent>
        
        <TabsContent value="export">
          <ExportData
            customers={customers}
            vegetables={vegetables}
            orders={orders}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
