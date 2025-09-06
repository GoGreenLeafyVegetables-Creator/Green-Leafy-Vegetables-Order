import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vegetable } from "@/types/vegetable";
import PhotoUpload from "@/components/ui/photo-upload";

interface VegetableFormProps {
  onSave: (vegetable: Omit<Vegetable, 'id'>) => void;
  onCancel: () => void;
  initialData?: Vegetable;
}

const VegetableForm: React.FC<VegetableFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Omit<Vegetable, "id">>(
    initialData
      ? {
          name: initialData.name,
          price: initialData.price,
          unit: initialData.unit,
          photo_url: initialData.photo_url,
        }
      : {
          name: "",
          price: 0,
          unit: "bunch",
          photo_url: "",
        }
  );

  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleUnitChange = (value: string) => {
    setFormData((prev) => ({ ...prev, unit: value }));
  };

  const handlePhotoChange = (photoUrl: string | null) => {
    setFormData((prev) => ({ ...prev, photo_url: photoUrl || "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name.trim() || formData.price <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name is required and price must be greater than 0",
      });
      return;
    }
    
    onSave(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Vegetable" : "Add New Vegetable"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <PhotoUpload
            currentPhotoUrl={formData.photo_url || undefined}
            onPhotoChange={handlePhotoChange}
            bucket="vegetable-photos"
            folder="vegetables"
          />
          
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Vegetable Name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select
              value={formData.unit}
              onValueChange={handleUnitChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bunch">Bunch</SelectItem>
                <SelectItem value="kg">Kilogram (kg)</SelectItem>
                <SelectItem value="g">Gram (g)</SelectItem>
                <SelectItem value="piece">Piece</SelectItem>
              </SelectContent>
            </Select>
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

export default VegetableForm;