
import React from "react";
import VegetableList from "@/components/vegetables/VegetableList";

const VegetablesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vegetable Management</h1>
        <p className="text-muted-foreground">
          Manage vegetable inventory and pricing
        </p>
      </div>
      <VegetableList />
    </div>
  );
};

export default VegetablesPage;
