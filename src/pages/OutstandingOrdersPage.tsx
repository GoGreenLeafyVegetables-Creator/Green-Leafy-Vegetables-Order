
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOrders, useCustomers } from "@/hooks/use-supabase-data";
import { Search, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OutstandingOrdersPage = () => {
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter customers who have outstanding balances
  const customersWithOutstanding = customers.filter(customer => {
    const customerOrders = orders.filter(order => order.customer_id === customer.id);
    return customerOrders.some(order => order.balance_amount > 0);
  });

  const filteredCustomers = customersWithOutstanding.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.mobile.includes(searchTerm) ||
      customer.shop_name?.toLowerCase().includes(searchLower)
    );
  });

  const getCustomerTotalOutstanding = (customerId: string) => {
    return orders
      .filter(order => order.customer_id === customerId && order.balance_amount > 0)
      .reduce((sum, order) => sum + order.balance_amount, 0);
  };

  const getCustomerOrderCount = (customerId: string) => {
    return orders.filter(order => order.customer_id === customerId && order.balance_amount > 0).length;
  };

  const handleCustomerClick = (customer: any) => {
    navigate(`/outstanding-orders/${customer.id}`, { state: { customer } });
  };

  if (ordersLoading || customersLoading) {
    return <div className="p-6">Loading outstanding orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outstanding Orders</h1>
        <p className="text-muted-foreground">
          Customers with pending payments and outstanding balances
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name, mobile, or shop name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {searchTerm ? "No customers found matching your search." : "No customers with outstanding payments."}
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer) => {
            const totalOutstanding = getCustomerTotalOutstanding(customer.id);
            const orderCount = getCustomerOrderCount(customer.id);

            return (
              <Card key={customer.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-6" onClick={() => handleCustomerClick(customer)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{customer.name}</h3>
                        <p className="text-sm text-muted-foreground">{customer.mobile}</p>
                        {customer.shop_name && (
                          <p className="text-sm text-muted-foreground">{customer.shop_name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          ₹{totalOutstanding.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {orderCount} pending {orderCount === 1 ? 'order' : 'orders'}
                        </div>
                      </div>
                      <Badge variant="destructive">Outstanding</Badge>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {filteredCustomers.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Total Outstanding Summary</h3>
              <p className="text-sm text-muted-foreground">
                {filteredCustomers.length} customers with pending payments
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                ₹{filteredCustomers.reduce((sum, customer) => 
                  sum + getCustomerTotalOutstanding(customer.id), 0
                ).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Outstanding</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutstandingOrdersPage;
