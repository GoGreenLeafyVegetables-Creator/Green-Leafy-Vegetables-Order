
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCustomers, useOrders } from "@/hooks/use-supabase-data";
import { Search, User, Phone, Store, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerBalancePage = () => {
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate balance for each customer
  const customersWithBalance = customers.map(customer => {
    const customerOrders = orders.filter(order => order.customer_id === customer.id);
    const totalBalance = customerOrders.reduce((sum, order) => sum + order.balance_amount, 0);
    const totalBusiness = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const orderCount = customerOrders.length;
    
    return {
      ...customer,
      balance: totalBalance,
      totalBusiness,
      orderCount
    };
  });

  // Filter customers with outstanding balances and search term
  const filteredCustomers = customersWithBalance.filter(customer => {
    const matchesSearch = searchTerm === "" || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile.includes(searchTerm) ||
      (customer.shop_name && customer.shop_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch && customer.balance !== 0;
  });

  // Sort by balance amount (highest due first, then advance amounts)
  const sortedCustomers = filteredCustomers.sort((a, b) => {
    if (a.balance > 0 && b.balance > 0) return b.balance - a.balance; // Highest due first
    if (a.balance < 0 && b.balance < 0) return a.balance - b.balance; // Smallest advance first
    if (a.balance > 0 && b.balance < 0) return -1; // Due amounts before advance
    if (a.balance < 0 && b.balance > 0) return 1; // Advance amounts after due
    return 0;
  });

  const getBalanceBadge = (balance: number) => {
    if (balance === 0) return <Badge className="bg-green-500">No Dues</Badge>;
    if (balance > 0) return <Badge variant="destructive">₹{balance.toFixed(2)} Due</Badge>;
    return <Badge className="bg-blue-500">₹{Math.abs(balance).toFixed(2)} Advance</Badge>;
  };

  const handleCustomerClick = (customerId: string) => {
    navigate(`/customer-details/${customerId}`);
  };

  if (customersLoading || ordersLoading) {
    return <div className="p-6">Loading customer balances...</div>;
  }

  const totalDue = sortedCustomers.reduce((sum, customer) => 
    sum + (customer.balance > 0 ? customer.balance : 0), 0
  );
  
  const totalAdvance = Math.abs(sortedCustomers.reduce((sum, customer) => 
    sum + (customer.balance < 0 ? customer.balance : 0), 0
  ));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outstanding Customer Balances</h1>
        <p className="text-muted-foreground">
          View and manage customers with outstanding balances (Due/Advance)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Due Amount</p>
              <p className="text-3xl font-bold text-red-600">₹{totalDue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Advance Amount</p>
              <p className="text-3xl font-bold text-blue-600">₹{totalAdvance.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Customers with Balance</p>
              <p className="text-3xl font-bold text-purple-600">{sortedCustomers.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers by name, mobile, or shop..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {sortedCustomers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? "No customers found matching your search." : "No customers with outstanding balances found."}
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6" onClick={() => handleCustomerClick(customer.id)}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-lg">{customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {customer.mobile}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {customer.shop_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <Store className="h-3 w-3 text-muted-foreground" />
                        {customer.shop_name}
                      </div>
                    )}
                    {customer.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {customer.location}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Business</p>
                    <p className="font-medium">₹{customer.totalBusiness.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{customer.orderCount} orders</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      {getBalanceBadge(customer.balance)}
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to view details
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerBalancePage;
