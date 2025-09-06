
import React, { useState } from "react";
import CustomerList from "@/components/customers/CustomerList";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerManagement from "@/components/customers/CustomerManagement";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/use-supabase-data";
import { Customer } from "@/types/customer";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
      console.error('Error deleting customer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete customer",
      });
    }
  };

  const handleManage = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowManagement(true);
  };

  const handleAddOrder = (customer: Customer) => {
    // Navigate to order form with pre-selected customer
    navigate(`/orders/new?customer=${customer.id}`);
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
      console.error('Error saving customer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save customer",
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
          initialData={editingCustomer}
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
          onAddOrder={handleAddOrder}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}
    </div>
  );
};

export default CustomersPage;
