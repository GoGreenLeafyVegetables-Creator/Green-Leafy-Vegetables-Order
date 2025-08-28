
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye } from "lucide-react";
import { useCustomers, useOrders } from "@/hooks/use-supabase-data";
import { useNavigate } from "react-router-dom";

const CustomerBalancePage = () => {
  const { data: customers = [] } = useCustomers();
  const { data: orders = [] } = useOrders();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate balances for each customer
  const customerBalances = customers.map(customer => {
    const customerOrders = orders.filter(order => order.customer_id === customer.id);
    const totalBalance = customerOrders.reduce((sum, order) => sum + order.balance_amount, 0);
    const totalBusiness = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
    
    return {
      ...customer,
      totalBalance,
      totalBusiness,
      orderCount: customerOrders.length
    };
  }).filter(customer => customer.totalBalance !== 0); // Only show customers with outstanding balance

  // Filter customers based on search
  const filteredCustomers = customerBalances.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.shop_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-red-600"; // Due amount
    if (balance < 0) return "text-blue-600"; // Advance payment
    return "text-green-600"; // No balance
  };

  const getBalanceBadge = (balance: number) => {
    if (balance > 0) return <Badge variant="destructive">Due</Badge>;
    if (balance < 0) return <Badge className="bg-blue-500">Advance</Badge>;
    return <Badge className="bg-green-500">Settled</Badge>;
  };

  const handleViewDetails = (customerId: string) => {
    navigate(`/customer-details/${customerId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outstanding Orders</h1>
        <p className="text-muted-foreground">
          View customers with outstanding balances and their transaction details
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, mobile, or shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {filteredCustomers.filter(c => c.totalBalance > 0).length}
            </div>
            <p className="text-sm text-muted-foreground">Customers with Due Amount</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              ₹{filteredCustomers
                .filter(c => c.totalBalance > 0)
                .reduce((sum, c) => sum + c.totalBalance, 0)
                .toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total Due Amount</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              ₹{Math.abs(filteredCustomers
                .filter(c => c.totalBalance < 0)
                .reduce((sum, c) => sum + c.totalBalance, 0))
                .toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total Advance Amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Total Business</TableHead>
                  <TableHead>Balance Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No customers with outstanding balances found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow 
                      key={customer.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(customer.id)}
                    >
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>{customer.mobile}</TableCell>
                      <TableCell>{customer.shop_name || '-'}</TableCell>
                      <TableCell>₹{customer.totalBusiness.toFixed(2)}</TableCell>
                      <TableCell className={getBalanceColor(customer.totalBalance)}>
                        ₹{Math.abs(customer.totalBalance).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getBalanceBadge(customer.totalBalance)}
                      </TableCell>
                      <TableCell>{customer.orderCount}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(customer.id);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerBalancePage;
