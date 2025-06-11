
import React from "react";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onEdit,
  onDelete,
  searchQuery,
  setSearchQuery,
}) => {
  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) =>
    Object.values(customer).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Customer List</CardTitle>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead className="hidden md:table-cell">Shop Name</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.shopName || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.location || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(customer.id)}
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
