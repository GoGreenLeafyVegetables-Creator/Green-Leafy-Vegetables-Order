
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerList from "@/components/customers/CustomerList";
import CustomerManagement from "@/components/customers/CustomerManagement";
import { useCustomers, useCreateCustomer } from "@/hooks/use-supabase-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";
import { useToast } from "@/components/ui/use-toast";

const CustomersPage = () => {
  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const updateCustomer = useMutation({
    mutationFn: async (customer: Customer) => {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: customer.name,
          mobile: customer.mobile,
          shop_name: customer.shop_name,
          location: customer.location
        })
        .eq('id', customer.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });

  const deleteCustomer = useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });

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
      deleteCustomer.mutate(deletingCustomerId, {
        onSuccess: () => {
          toast({
            title: "Customer Deleted",
            description: "The customer has been removed successfully",
          });
          setIsDeleteDialogOpen(false);
          setDeletingCustomerId(null);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete customer",
          });
        }
      });
    }
  };

  const handleSaveCustomer = (customer: Customer) => {
    if (editingCustomer) {
      updateCustomer.mutate(customer, {
        onSuccess: () => {
          toast({
            title: "Customer Updated",
            description: "Customer information has been updated successfully",
          });
          setIsFormOpen(false);
        }
      });
    } else {
      createCustomer.mutate(customer, {
        onSuccess: () => {
          toast({
            title: "Customer Created",
            description: "New customer has been added successfully",
          });
          setIsFormOpen(false);
        }
      });
    }
  };

  const handleManageCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  if (isLoading) {
    return <div className="space-y-6">Loading customers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <Button onClick={handleAddCustomer}>Add Customer</Button>
      </div>
      
      {selectedCustomer ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCustomer(null)}
          >
            ← Back to Customer List
          </Button>
          <CustomerManagement customer={selectedCustomer} />
        </div>
      ) : (
        <CustomerList 
          customers={customers}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
          onManage={handleManageCustomer}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}
      
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
