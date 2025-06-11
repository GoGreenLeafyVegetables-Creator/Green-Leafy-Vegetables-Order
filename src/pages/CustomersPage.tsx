
import React, { useState } from "react";
import CustomerList from "@/components/customers/CustomerList";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerManagement from "@/components/customers/CustomerManagement";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/use-supabase-data";
import { Customer } from "@/types/customer";
import { useToast } from "@/components/ui/use-toast";

const CustomersPage = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const { toast } = useToast();

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (customerId: string) => {
    try {
      await deleteCustomer.mutateAsync(customerId);
      toast({
        title: "Customer deleted",
        description: "Customer has been deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete customer",
      });
    }
  };

  const handleManage = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowManagement(true);
  };

  const handleSaveCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({ id: editingCustomer.id, ...customerData });
        toast({
          title: "Customer updated",
          description: "Customer has been updated successfully",
        });
      } else {
        await createCustomer.mutateAsync(customerData);
        toast({
          title: "Customer created",
          description: "Customer has been created successfully",
        });
      }
      setShowForm(false);
      setEditingCustomer(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save customer",
      });
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {editingCustomer ? "Edit Customer" : "Add New Customer"}
          </h1>
          <p className="text-muted-foreground">
            {editingCustomer ? "Update customer information" : "Add a new customer to the system"}
          </p>
        </div>
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onCancel={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
        />
      </div>
    );
  }

  if (showManagement && selectedCustomer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
            <p className="text-muted-foreground">
              Manage customer analytics, QR codes, and generate reports
            </p>
          </div>
          <button
            onClick={() => {
              setShowManagement(false);
              setSelectedCustomer(null);
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Customer List
          </button>
        </div>
        <CustomerManagement customer={selectedCustomer} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage customers, view their business analytics, and generate QR codes
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Add New Customer
        </button>
      </div>
      
      {isLoading ? (
        <div>Loading customers...</div>
      ) : (
        <CustomerList
          customers={customers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManage={handleManage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}
    </div>
  );
};

export default CustomersPage;
