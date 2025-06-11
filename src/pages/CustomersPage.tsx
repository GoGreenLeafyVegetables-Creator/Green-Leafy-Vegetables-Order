
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerList from "@/components/customers/CustomerList";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Customer } from "@/types/customer";
import { useToast } from "@/components/ui/use-toast";

const CustomersPage = () => {
  const [customers, setCustomers] = useLocalStorage<Customer[]>("customers", []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleAddCustomer = () => {
    setEditingCustomer(undefined);
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setDeletingCustomerId(customerId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCustomer = () => {
    if (deletingCustomerId) {
      setCustomers(customers.filter(customer => customer.id !== deletingCustomerId));
      
      toast({
        title: "Customer Deleted",
        description: "The customer has been removed successfully",
      });
      
      setIsDeleteDialogOpen(false);
      setDeletingCustomerId(null);
    }
  };

  const handleSaveCustomer = (customer: Customer) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    } else {
      // Add new customer
      setCustomers([...customers, customer]);
    }
    
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <Button onClick={handleAddCustomer}>Add Customer</Button>
      </div>
      
      <CustomerList 
        customers={customers}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <CustomerForm 
            onSave={handleSaveCustomer}
            onCancel={() => setIsFormOpen(false)}
            initialData={editingCustomer}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCustomer}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomersPage;
