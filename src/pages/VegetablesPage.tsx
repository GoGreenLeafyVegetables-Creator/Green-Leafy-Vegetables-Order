
import React, { useState } from "react";
import VegetableList from "@/components/vegetables/VegetableList";
import VegetableForm from "@/components/vegetables/VegetableForm";
import { useVegetables, useCreateVegetable, useUpdateVegetable, useDeleteVegetable } from "@/hooks/use-supabase-data";
import { Vegetable } from "@/types/vegetable";
import { useToast } from "@/components/ui/use-toast";

const VegetablesPage = () => {
  const [editingVegetable, setEditingVegetable] = useState<Vegetable | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: vegetables = [], isLoading } = useVegetables();
  const createVegetable = useCreateVegetable();
  const updateVegetable = useUpdateVegetable();
  const deleteVegetable = useDeleteVegetable();
  const { toast } = useToast();

  const handleEdit = (vegetable: Vegetable) => {
    setEditingVegetable(vegetable);
    setShowForm(true);
  };

  const handleDelete = async (vegetableId: string) => {
    try {
      await deleteVegetable.mutateAsync(vegetableId);
      toast({
        title: "Vegetable deleted",
        description: "Vegetable has been deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete vegetable",
      });
    }
  };

  const handleSaveVegetable = async (vegetableData: Omit<Vegetable, 'id'>) => {
    try {
      if (editingVegetable) {
        await updateVegetable.mutateAsync({ id: editingVegetable.id, ...vegetableData });
        toast({
          title: "Vegetable updated",
          description: "Vegetable has been updated successfully",
        });
      } else {
        await createVegetable.mutateAsync(vegetableData);
        toast({
          title: "Vegetable created",
          description: "Vegetable has been created successfully",
        });
      }
      setShowForm(false);
      setEditingVegetable(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save vegetable",
      });
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {editingVegetable ? "Edit Vegetable" : "Add New Vegetable"}
          </h1>
          <p className="text-muted-foreground">
            {editingVegetable ? "Update vegetable information" : "Add a new vegetable to the inventory"}
          </p>
        </div>
        <VegetableForm
          initialData={editingVegetable}
          onSave={handleSaveVegetable}
          onCancel={() => {
            setShowForm(false);
            setEditingVegetable(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vegetable Management</h1>
          <p className="text-muted-foreground">
            Manage vegetable inventory and pricing
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Add New Vegetable
        </button>
      </div>
      
      {isLoading ? (
        <div>Loading vegetables...</div>
      ) : (
        <VegetableList
          vegetables={vegetables}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}
    </div>
  );
};

export default VegetablesPage;
