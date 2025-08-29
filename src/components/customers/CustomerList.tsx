
import React from "react";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, Settings, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onManage: (customer: Customer) => void;
  onAddOrder: (customer: Customer) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onEdit,
  onDelete,
  onManage,
  onAddOrder,
  searchQuery,
  setSearchQuery,
}) => {
  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.mobile.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.shop_name && customer.shop_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (customer.customer_code && customer.customer_code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Customer List</CardTitle>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers by name, mobile, shop, or customer ID..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredCustomers.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead className="hidden md:table-cell">Shop</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      {customer.photo_url ? (
                        <img
                          src={customer.photo_url}
                          alt={customer.name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {customer.customer_code || 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {customer.shop_name || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {customer.location || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onAddOrder(customer)}
                          title="Add Order"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span className="sr-only">Add Order</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onManage(customer)}
                          title="Manage"
                        >
                          <Settings className="h-4 w-4" />
                          <span className="sr-only">Manage</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(customer)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(customer.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "No customers match your search"
                : "No customers found. Add your first customer!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerList;
