
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { Order } from "@/types/order";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";

interface CustomerReportViewProps {
  orders: Order[];
  customers: Customer[];
  vegetables: Vegetable[];
}

const CustomerReportView: React.FC<CustomerReportViewProps> = ({ orders, customers, vegetables }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");

  // Filter orders by selected customer
  const customerOrders = orders.filter((order) => 
    selectedCustomerId === "all" || order.customer_id === selectedCustomerId
  ).sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

  const generatePDFReport = () => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    const totalBusiness = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalPaid = customerOrders.reduce((sum, order) => sum + order.paid_amount, 0);
    const totalBalance = customerOrders.reduce((sum, order) => sum + order.balance_amount, 0);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Report - ${customer ? customer.name : 'All Customers'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { color: #22c55e; font-size: 24px; font-weight: bold; }
            .customer-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .summary-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
            .summary-card h3 { margin: 0 0 10px 0; color: #333; }
            .summary-card .value { font-size: 20px; font-weight: bold; color: #22c55e; }
            .orders-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .orders-table th, .orders-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .orders-table th { background-color: #f2f2f2; }
            .balance-due { color: #dc2626; font-weight: bold; }
            .balance-advance { color: #059669; font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">GO GREEN LEAFY VEGETABLES</div>
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
          
          <h3>Order Details</h3>
          <table class="orders-table">
            <thead>
              <tr>
                <th>Date</th>
                ${!customer ? '<th>Customer</th>' : ''}
                <th>Order ID</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Balance</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${customerOrders.map(order => {
                const orderCustomer = customers.find(c => c.id === order.customer_id);
                return `
                  <tr>
                    <td>${format(new Date(order.order_date), "dd/MM/yyyy")}</td>
                    ${!customer ? `<td>${orderCustomer?.name || 'Unknown'}</td>` : ''}
                    <td>${order.id.substring(0, 8)}</td>
                    <td>₹${order.total_amount.toFixed(2)}</td>
                    <td>₹${order.paid_amount.toFixed(2)}</td>
                    <td class="${order.balance_amount > 0 ? 'balance-due' : order.balance_amount < 0 ? 'balance-advance' : ''}">
                      ₹${order.balance_amount.toFixed(2)}
                    </td>
                    <td style="text-transform: capitalize;">${order.payment_method || 'cash'}</td>
                    <td style="text-transform: capitalize;">${order.payment_status}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 40px; font-size: 12px; color: #666; text-align: center;">
            Generated by GO GREEN LEAFY VEGETABLES Management System
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
        <CardTitle>Customer Reports (PDF Only)</CardTitle>
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
            disabled={customerOrders.length === 0}
            className="w-full md:w-auto"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate PDF Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {customerOrders.length > 0 ? (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">PDF Reports Only</h3>
            <p className="text-muted-foreground mb-4">
              All customer reports are generated as PDF documents for better printing and sharing.
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
  );
};

export default CustomerReportView;
