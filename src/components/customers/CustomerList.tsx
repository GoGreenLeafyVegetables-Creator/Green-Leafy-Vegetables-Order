
import React from "react";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, Settings, QrCode, Plus, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onManage: (customer: Customer) => void;
  onAddOrder?: (customer: Customer) => void;
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
    Object.values(customer).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleOpenCustomerOrderPage = (customer: Customer) => {
    const url = `/simple-order/${customer.qr_code}`;
    window.open(url, '_blank');
  };

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
                  <TableHead className="hidden md:table-cell">QR Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.shop_name || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <QrCode className="h-3 w-3" />
                        <span className="text-xs">{customer.qr_code}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border">
                          <DropdownMenuItem onClick={() => handleOpenCustomerOrderPage(customer)}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Customer Order Page
                          </DropdownMenuItem>
                          {onAddOrder && (
                            <DropdownMenuItem onClick={() => onAddOrder(customer)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Order
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onManage(customer)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(customer)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(customer.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
