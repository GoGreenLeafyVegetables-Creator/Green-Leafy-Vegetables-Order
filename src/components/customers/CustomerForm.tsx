
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Customer } from "@/types/customer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerFormProps {
  onSave: (customer: Customer) => void;
  onCancel: () => void;
  initialData?: Customer;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Omit<Customer, "id">>(
    initialData
      ? {
          name: initialData.name,
          mobile: initialData.mobile,
          shopName: initialData.shopName,
          location: initialData.location,
        }
      : {
          name: "",
          mobile: "",
          shopName: "",
          location: "",
        }
  );

  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name.trim() || !formData.mobile.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name and mobile number are required",
      });
      return;
    }
    
    // Create new customer or update existing one
    const customerData: Customer = initialData
      ? { ...initialData, ...formData }
      : { id: Date.now().toString(), ...formData };
    
    onSave(customerData);
    
    toast({
      title: initialData ? "Customer Updated" : "Customer Added",
      description: `${formData.name} has been ${initialData ? "updated" : "added"} successfully`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Customer" : "Add New Customer"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Customer Name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile Number"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shopName">Shop Name</Label>
            <Input
              id="shopName"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="Shop Name (Optional)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location (Optional)"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update" : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CustomerForm;
