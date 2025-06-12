
import React from "react";
import CompleteBackup from "@/components/backup/CompleteBackup";
import ExportData from "@/components/reports/ExportData";
import { useCustomers, useVegetables, useOrders } from "@/hooks/use-supabase-data";

const BackupPage = () => {
  const { data: customers = [] } = useCustomers();
  const { data: vegetables = [] } = useVegetables();
  const { data: orders = [] } = useOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Backup & Export</h1>
        <p className="text-muted-foreground">
          Create complete backups of your website and export data in various formats
        </p>
      </div>
      
      <div className="space-y-6">
        <CompleteBackup />
        <ExportData 
          customers={customers}
          vegetables={vegetables}
          orders={orders}
        />
      </div>
    </div>
  );
};

export default BackupPage;
