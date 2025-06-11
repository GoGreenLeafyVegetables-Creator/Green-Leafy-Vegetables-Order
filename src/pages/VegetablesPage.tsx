
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import VegetableForm from "@/components/vegetables/VegetableForm";
import VegetableList from "@/components/vegetables/VegetableList";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Vegetable } from "@/types/vegetable";
import { useToast } from "@/components/ui/use-toast";

const VegetablesPage = () => {
  const [vegetables, setVegetables] = useLocalStorage<Vegetable[]>("vegetables", []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingVegetable, setEditingVegetable] = useState<Vegetable | undefined>(undefined);
  const [deletingVegetableId, setDeletingVegetableId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleAddVegetable = () => {
    setEditingVegetable(undefined);
    setIsFormOpen(true);
  };

  const handleEditVegetable = (vegetable: Vegetable) => {
    setEditingVegetable(vegetable);
    setIsFormOpen(true);
  };

  const handleDeleteVegetable = (vegetableId: string) => {
    setDeletingVegetableId(vegetableId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteVegetable = () => {
    if (deletingVegetableId) {
      setVegetables(vegetables.filter(vegetable => vegetable.id !== deletingVegetableId));
      
      toast({
        title: "Vegetable Deleted",
        description: "The vegetable has been removed successfully",
      });
      
      setIsDeleteDialogOpen(false);
      setDeletingVegetableId(null);
    }
  };

  const handleSaveVegetable = (vegetable: Vegetable) => {
    if (editingVegetable) {
      // Update existing vegetable
      setVegetables(vegetables.map(v => v.id === vegetable.id ? vegetable : v));
    } else {
      // Add new vegetable
      setVegetables([...vegetables, vegetable]);
    }
    
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Vegetables</h1>
        <Button onClick={handleAddVegetable}>Add Vegetable</Button>
      </div>
      
      <VegetableList 
        vegetables={vegetables}
        onEdit={handleEditVegetable}
        onDelete={handleDeleteVegetable}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <VegetableForm 
            onSave={handleSaveVegetable}
            onCancel={() => setIsFormOpen(false)}
            initialData={editingVegetable}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vegetable? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVegetable}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VegetablesPage;
