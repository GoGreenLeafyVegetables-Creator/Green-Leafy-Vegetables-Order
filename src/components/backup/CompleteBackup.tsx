
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Database, FileText, Package } from "lucide-react";
import { useCustomers, useVegetables, useOrders } from "@/hooks/use-supabase-data";
import { useToast } from "@/components/ui/use-toast";
import JSZip from "jszip";

const CompleteBackup = () => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const { data: customers = [] } = useCustomers();
  const { data: vegetables = [] } = useVegetables();
  const { data: orders = [] } = useOrders();
  const { toast } = useToast();

  const createCompleteBackup = async () => {
    setIsCreatingBackup(true);
    
    try {
      const zip = new JSZip();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      
      // Create backup metadata
      const backupInfo = {
        created_at: new Date().toISOString(),
        backup_version: "1.0",
        app_name: "Go Green Leafy Vegetables Management",
        total_customers: customers.length,
        total_vegetables: vegetables.length,
        total_orders: orders.length,
        database_schema_version: "v1.0"
      };

      // Add metadata
      zip.file("backup_info.json", JSON.stringify(backupInfo, null, 2));

      // Create data folder
      const dataFolder = zip.folder("data");
      
      // Export customers data
      dataFolder?.file("customers.json", JSON.stringify(customers, null, 2));
      
      // Create customers CSV
      const customersCSV = [
        ["ID", "Name", "Mobile", "Shop Name", "Location", "QR Code", "Created At"].join(","),
        ...customers.map(customer => 
          [
            customer.id,
            `"${customer.name}"`,
            `"${customer.mobile}"`,
            `"${customer.shop_name || ""}"`,
            `"${customer.location || ""}"`,
            `"${customer.qr_code || ""}"`,
            new Date(customer.created_at || "").toISOString()
          ].join(",")
        )
      ].join("\n");
      dataFolder?.file("customers.csv", customersCSV);

      // Export vegetables data
      dataFolder?.file("vegetables.json", JSON.stringify(vegetables, null, 2));
      
      // Create vegetables CSV
      const vegetablesCSV = [
        ["ID", "Name", "Price", "Unit", "Created At"].join(","),
        ...vegetables.map(vegetable => 
          [
            vegetable.id,
            `"${vegetable.name}"`,
            vegetable.price,
            vegetable.unit,
            new Date(vegetable.created_at || "").toISOString()
          ].join(",")
        )
      ].join("\n");
      dataFolder?.file("vegetables.csv", vegetablesCSV);

      // Export orders data
      dataFolder?.file("orders.json", JSON.stringify(orders, null, 2));
      
      // Create orders CSV
      const ordersCSV = [
        ["Order ID", "Customer ID", "Date", "Total Amount", "Payment Status", "Payment Method", "Paid Amount", "Balance", "Created At"].join(","),
        ...orders.map(order => 
          [
            order.id,
            order.customer_id,
            new Date(order.order_date).toISOString().split('T')[0],
            order.total_amount.toFixed(2),
            order.payment_status,
            order.payment_method,
            order.paid_amount?.toFixed(2) || "0.00",
            order.balance_amount?.toFixed(2) || "0.00",
            new Date(order.created_at || "").toISOString()
          ].join(",")
        )
      ].join("\n");
      dataFolder?.file("orders.csv", ordersCSV);

      // Create order items CSV
      const orderItemsCSV = [
        ["Order ID", "Vegetable ID", "Quantity", "Unit Price", "Total Price"].join(","),
        ...orders.flatMap(order => 
          (order.order_items || []).map(item => 
            [
              order.id,
              item.vegetable_id,
              item.quantity,
              item.unit_price,
              item.total_price
            ].join(",")
          )
        )
      ].join("\n");
      dataFolder?.file("order_items.csv", orderItemsCSV);

      // Create database schema documentation
      const schemaDoc = `# Go Green Leafy Vegetables - Database Schema

## Tables

### customers
- id: UUID (Primary Key)
- name: TEXT (Required)
- mobile: TEXT (Required)
- shop_name: TEXT (Optional)
- location: TEXT (Optional)
- qr_code: TEXT (Unique, Auto-generated)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### vegetables
- id: UUID (Primary Key)
- name: TEXT (Required)
- price: DECIMAL(10,2) (Required)
- unit: TEXT (Required)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### orders
- id: UUID (Primary Key)
- customer_id: UUID (Foreign Key -> customers.id)
- order_date: DATE (Required)
- total_amount: DECIMAL(10,2)
- payment_status: TEXT (pending/partial/paid)
- payment_method: TEXT (cash/upi/mixed)
- paid_amount: DECIMAL(10,2)
- balance_amount: DECIMAL(10,2)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### order_items
- id: UUID (Primary Key)
- order_id: UUID (Foreign Key -> orders.id)
- vegetable_id: UUID (Foreign Key -> vegetables.id)
- quantity: DECIMAL(10,2)
- unit_price: DECIMAL(10,2)
- total_price: DECIMAL(10,2)
- created_at: TIMESTAMP

### payments
- id: UUID (Primary Key)
- customer_id: UUID (Foreign Key -> customers.id)
- order_id: UUID (Foreign Key -> orders.id, Optional)
- amount: DECIMAL(10,2)
- payment_date: DATE
- payment_method: TEXT
- notes: TEXT (Optional)
- created_at: TIMESTAMP
`;

      zip.file("database_schema.md", schemaDoc);

      // Create restore instructions
      const restoreInstructions = `# Restore Instructions

## How to restore your backup

1. **Database Setup**
   - Create a new Supabase project or use existing one
   - Run the SQL migrations from the original project
   - Import data using the provided JSON files

2. **Data Import Order**
   1. Import customers first (customers.json)
   2. Import vegetables (vegetables.json)
   3. Import orders (orders.json)
   4. Order items will be included with orders

3. **CSV Files**
   - Use CSV files for importing into other systems
   - Compatible with Excel, Google Sheets, etc.

4. **Application Setup**
   - Update Supabase configuration in the app
   - Test all functionality after restore

## Backup Created: ${new Date().toISOString()}
## Total Records:
- Customers: ${customers.length}
- Vegetables: ${vegetables.length}
- Orders: ${orders.length}
`;

      zip.file("RESTORE_INSTRUCTIONS.md", restoreInstructions);

      // Generate and download the backup
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(content);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `go-green-leafy-backup-${timestamp}.zip`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Backup Created Successfully",
        description: `Complete backup downloaded with ${customers.length} customers, ${vegetables.length} vegetables, and ${orders.length} orders.`,
      });

    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        variant: "destructive",
        title: "Backup Failed",
        description: "Failed to create complete backup. Please try again.",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Complete Website Backup
        </CardTitle>
        <CardDescription>
          Create a complete backup of your entire website including all data, schema, and restore instructions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <div className="font-medium">{customers.length}</div>
              <div className="text-xs text-muted-foreground">Customers</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Package className="h-4 w-4 text-green-500" />
            <div>
              <div className="font-medium">{vegetables.length}</div>
              <div className="text-xs text-muted-foreground">Vegetables</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <FileText className="h-4 w-4 text-orange-500" />
            <div>
              <div className="font-medium">{orders.length}</div>
              <div className="text-xs text-muted-foreground">Orders</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Backup includes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• All customer data (JSON + CSV format)</li>
            <li>• All vegetable inventory (JSON + CSV format)</li>
            <li>• All orders and order items (JSON + CSV format)</li>
            <li>• Database schema documentation</li>
            <li>• Complete restore instructions</li>
            <li>• Backup metadata and version info</li>
          </ul>
        </div>

        <Button 
          onClick={createCompleteBackup} 
          disabled={isCreatingBackup}
          className="w-full"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          {isCreatingBackup ? "Creating Backup..." : "Download Complete Backup"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompleteBackup;
