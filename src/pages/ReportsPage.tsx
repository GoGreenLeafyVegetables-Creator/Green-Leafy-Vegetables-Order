
import React from "react";
import DailyReportView from "@/components/reports/DailyReportView";
import CustomerReportView from "@/components/reports/CustomerReportView";
import ExportData from "@/components/reports/ExportData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders, useCustomers, useVegetables } from "@/hooks/use-supabase-data";

const ReportsPage = () => {
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: vegetables = [], isLoading: vegetablesLoading } = useVegetables();

  if (ordersLoading || customersLoading || vegetablesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            View business reports and export data
          </p>
        </div>
        <div>Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          View business reports and export data
        </p>
      </div>
      
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Reports</TabsTrigger>
          <TabsTrigger value="customer">Customer Reports</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Report</CardTitle>
            </CardHeader>
            <CardContent>
              <DailyReportView orders={orders} vegetables={vegetables} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle>Customer Business Report</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerReportView orders={orders} customers={customers} vegetables={vegetables} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Business Data</CardTitle>
            </CardHeader>
            <CardContent>
              <ExportData customers={customers} vegetables={vegetables} orders={orders} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
