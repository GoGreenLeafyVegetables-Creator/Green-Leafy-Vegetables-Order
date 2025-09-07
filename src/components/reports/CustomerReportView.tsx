
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, User, FileText, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Order } from "@/types/order";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";
import ganeshaLogo from "@/assets/ganesha-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomerReportViewProps {
  orders: Order[];
  customers: Customer[];
  vegetables: Vegetable[];
}

const CustomerReportView: React.FC<CustomerReportViewProps> = ({ orders, customers, vegetables }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [storedReports, setStoredReports] = useState<any[]>([]);
  const { toast } = useToast();

  // Load stored reports on component mount
  React.useEffect(() => {
    loadStoredReports();
  }, []);

  const loadStoredReports = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_pdf_reports')
        .select(`
          *,
          customers(name, customer_code)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setStoredReports(data || []);
    } catch (error) {
      console.error('Error loading stored reports:', error);
    }
  };

  // Filter orders by selected customer
  const customerOrders = orders.filter((order) => 
    selectedCustomerId === "all" || order.customer_id === selectedCustomerId
  ).sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

  const generatePDFReport = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const customer = customers.find(c => c.id === selectedCustomerId);
      const totalBusiness = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const totalPaid = customerOrders.reduce((sum, order) => sum + order.paid_amount, 0);
      const totalBalance = customerOrders.reduce((sum, order) => sum + order.balance_amount, 0);
      
      // Create filename and storage path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const customerName = customer ? customer.name.replace(/[^a-zA-Z0-9]/g, '_') : 'All_Customers';
      const fileName = `${customerName}_Report_${timestamp}.pdf`;
      const storagePath = `${customerName}/${fileName}`;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setIsGenerating(false);
        return;
      }
    
    // Get order items details for each order
    const getOrderItemsHtml = (order: Order) => {
      if (!order.order_items || order.order_items.length === 0) {
        return '<tr><td colspan="4" style="text-align: center; color: #666;">No items found</td></tr>';
      }
      
      return order.order_items.map(item => {
        const vegetable = vegetables.find(v => v.id === item.vegetable_id);
        return `
          <tr>
            <td>${vegetable?.name || 'Unknown Vegetable'}</td>
            <td>${item.quantity} ${vegetable?.unit || 'units'}</td>
            <td>₹${item.unit_price.toFixed(2)}</td>
            <td>₹${item.total_price.toFixed(2)}</td>
          </tr>
        `;
      }).join('');
    };
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Report - ${customer ? customer.name : 'All Customers'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { width: 200px; height: 200px; margin: 0 auto 10px auto; display: block; border-radius: 8px; }
            .company-name { color: #22c55e; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .customer-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .summary-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
            .summary-card h3 { margin: 0 0 10px 0; color: #333; }
            .summary-card .value { font-size: 20px; font-weight: bold; color: #22c55e; }
            .orders-section { margin: 30px 0; }
            .order-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px; padding: 15px; }
            .order-header { background: #f3f4f6; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
            .order-items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .order-items-table th, .order-items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .order-items-table th { background-color: #f8f9fa; font-weight: bold; }
            .orders-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .orders-table th, .orders-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .orders-table th { background-color: #f2f2f2; }
            .balance-due { color: #dc2626; font-weight: bold; }
            .balance-advance { color: #059669; font-weight: bold; }
            .order-total { font-weight: bold; color: #22c55e; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${ganeshaLogo}" alt="Lord Ganesha - Shree Ganesha Green Leafy Vegetables Logo" class="logo" />
            <div class="company-name">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
            <div>Customer Business Report</div>
          </div>
          
          ${customer ? `
            <div class="customer-info">
              <h2>Customer Information</h2>
              <p><strong>Name:</strong> ${customer.name}</p>
              <p><strong>Mobile:</strong> ${customer.mobile}</p>
              ${customer.shop_name ? `<p><strong>Shop:</strong> ${customer.shop_name}</p>` : ''}
              ${customer.location ? `<p><strong>Location:</strong> ${customer.location}</p>` : ''}
              <p><strong>Customer Code:</strong> ${customer.qr_code}</p>
              <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          ` : `
            <div class="customer-info">
              <h2>All Customers Report</h2>
              <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Total Customers:</strong> ${customers.length}</p>
            </div>
          `}
          
          <div class="summary-grid">
            <div class="summary-card">
              <h3>Total Business</h3>
              <div class="value">₹${totalBusiness.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <h3>Total Paid</h3>
              <div class="value">₹${totalPaid.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <h3>Outstanding Balance</h3>
              <div class="value ${totalBalance > 0 ? 'balance-due' : 'balance-advance'}">
                ₹${Math.abs(totalBalance).toFixed(2)}
              </div>
            </div>
            <div class="summary-card">
              <h3>Total Orders</h3>
              <div class="value">${customerOrders.length}</div>
            </div>
          </div>
          
          <div class="orders-section">
            <h3>Detailed Order Information</h3>
            ${customerOrders.map(order => {
              const orderCustomer = customers.find(c => c.id === order.customer_id);
              return `
                <div class="order-card">
                  <div class="order-header">
                    <strong>Order #SGLV-${order.id.slice(-4)}</strong> - 
                    ${format(new Date(order.order_date), "dd/MM/yyyy")}
                    ${!customer ? ` - ${orderCustomer?.name || 'Unknown Customer'}` : ''}
                  </div>
                  
                  <table class="order-items-table">
                    <thead>
                      <tr>
                        <th>Vegetable</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${getOrderItemsHtml(order)}
                    </tbody>
                  </table>
                  
                  <div style="margin-top: 15px; text-align: right;">
                    <p><strong>Total Amount:</strong> <span class="order-total">₹${order.total_amount.toFixed(2)}</span></p>
                    <p><strong>Paid Amount:</strong> ₹${order.paid_amount.toFixed(2)}</p>
                    <p><strong>Balance:</strong> 
                      <span class="${order.balance_amount > 0 ? 'balance-due' : order.balance_amount < 0 ? 'balance-advance' : ''}">
                        ₹${order.balance_amount.toFixed(2)}
                      </span>
                    </p>
                    <p><strong>Payment Method:</strong> ${(order.payment_method || 'cash').toUpperCase()}</p>
                    <p><strong>Status:</strong> ${(order.payment_status || 'pending').toUpperCase()}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
          <div style="margin-top: 40px; font-size: 12px; color: #666; text-align: center;">
            Generated by SHREE GANESHA GREEN LEAFY VEGETABLES Management System<br>
            Report Date: ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;
    
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait a bit before printing to ensure content is loaded
      setTimeout(async () => {
        printWindow.print();
        
        // Save report metadata to database
        try {
          const { error } = await supabase
            .from('customer_pdf_reports')
            .insert({
              customer_id: selectedCustomerId === "all" ? null : selectedCustomerId,
              file_name: fileName,
              file_path: storagePath,
              storage_path: storagePath,
              report_type: 'customer_business_report',
              file_size: new Blob([htmlContent]).size
            });
          
          if (error) throw error;
          
          toast({
            title: "Report Generated",
            description: "PDF report has been generated and saved successfully."
          });
          
          // Reload stored reports
          loadStoredReports();
        } catch (error) {
          console.error('Error saving report metadata:', error);
          toast({
            title: "Report Generated",
            description: "PDF generated but failed to save metadata to database.",
            variant: "destructive"
          });
        }
        
        setIsGenerating(false);
      }, 1000);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  const deleteStoredReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('customer_pdf_reports')
        .delete()
        .eq('id', reportId);
      
      if (error) throw error;
      
      toast({
        title: "Report Deleted",
        description: "Report has been deleted successfully."
      });
      
      loadStoredReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate New Report Section */}
      <Card className="w-full">
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
          <CardTitle>Generate Customer Report</CardTitle>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="w-full md:w-64">
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={generatePDFReport} 
              disabled={customerOrders.length === 0 || isGenerating}
              className="w-full md:w-auto"
            >
              <FileText className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate PDF Report"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {customerOrders.length > 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Generate & Save Reports</h3>
              <p className="text-muted-foreground mb-4">
                Generate PDF reports for customers and save them to database for future reference.
              </p>
              <p className="text-sm text-muted-foreground">
                Orders found: {customerOrders.length} | 
                Selected: {selectedCustomerId === "all" ? "All Customers" : customers.find(c => c.id === selectedCustomerId)?.name}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">
                {selectedCustomerId !== "all"
                  ? "No orders found for the selected customer"
                  : "No orders found. Create your first order!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stored Reports Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Stored Customer Reports</CardTitle>
          <p className="text-sm text-muted-foreground">
            Previously generated customer reports stored in database
          </p>
        </CardHeader>
        <CardContent>
          {storedReports.length > 0 ? (
            <div className="space-y-4">
              {storedReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {report.customers?.name || 'All Customers'} Report
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Generated on {format(new Date(report.created_at), "PPP 'at' pp")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      File: {report.file_name} • Size: {(report.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Re-generate and view the report
                        if (report.customer_id) {
                          setSelectedCustomerId(report.customer_id);
                          generatePDFReport();
                        } else {
                          setSelectedCustomerId("all");
                          generatePDFReport();
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteStoredReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Stored Reports</h3>
              <p className="text-muted-foreground">
                Generate your first customer report to see it here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerReportView;
