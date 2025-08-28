
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { useOrders, useVegetables } from "@/hooks/use-supabase-data";
import { format } from "date-fns";
import CustomerPDFEditor from "./CustomerPDFEditor";
import { Settings, FileText } from "lucide-react";

interface CustomerPDFReportProps {
  customer: Customer;
  analytics: any;
  onClose: () => void;
}

const CustomerPDFReport: React.FC<CustomerPDFReportProps> = ({ customer, analytics, onClose }) => {
  const { data: orders = [] } = useOrders();
  const { data: vegetables = [] } = useVegetables();
  const [showEditor, setShowEditor] = useState(false);
  
  // Filter orders for this customer and sort by date
  const customerOrders = orders
    .filter(order => order.customer_id === customer.id)
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

  const generateCustomerPageQR = () => {
    const customerUrl = `${window.location.origin}/customer/${customer.qr_code}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(customerUrl)}`;
  };

  const generateUPIQRCode = (amount: number) => {
    const upiId = "chowdaryindianbank@ybl";
    const upiString = `upi://pay?pa=${upiId}&pn=SHREE%20GANESHA%20GREEN%20LEAFY%20VEGETABLES&am=${amount}&cu=INR&tn=Customer%20${customer.qr_code}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  };

  const generatePDF = (sections?: any[], customizations?: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Use customizations or defaults
    const config = customizations || {
      companyName: 'SHREE GANESHA GREEN LEAFY VEGETABLES',
      showUpiId: false,
      pageBreakAfterAnalytics: false,
      ordersPerPage: 3,
      includeItemDetails: true,
      customNote: '',
    };

    // Helper function to get order items HTML
    const getOrderItemsHtml = (order: any) => {
      if (!config.includeItemDetails || !order.order_items || order.order_items.length === 0) {
        return '<tr><td colspan="4" style="text-align: center; color: #666; padding: 15px;">Item details not included</td></tr>';
      }
      
      return order.order_items.map((item: any) => {
        const vegetable = vegetables.find(v => v.id === item.vegetable_id);
        return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${vegetable?.name || 'Unknown Vegetable'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity} ${vegetable?.unit || 'units'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${item.unit_price.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${item.total_price.toFixed(2)}</td>
          </tr>
        `;
      }).join('');
    };

    // Helper function to generate order details HTML with pagination
    const getOrdersHtml = () => {
      if (customerOrders.length === 0) {
        return '<div style="text-align: center; color: #666; padding: 40px;">No orders found for this customer.</div>';
      }

      const ordersPerPage = config.ordersPerPage;
      let html = '';
      
      for (let i = 0; i < customerOrders.length; i += ordersPerPage) {
        const pageOrders = customerOrders.slice(i, i + ordersPerPage);
        
        if (i > 0) {
          html += '<div class="page-break"></div>';
        }
        
        html += pageOrders.map(order => `
          <div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; page-break-inside: avoid;">
            <div style="background: #f9fafb; padding: 15px; border-bottom: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="font-size: 16px;">Order #${order.id.substring(0, 8)}</strong>
                  <div style="color: #666; margin-top: 5px;">Order Date: ${format(new Date(order.order_date), "dd/MM/yyyy")}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 18px; font-weight: bold; color: #22c55e;">₹${order.total_amount.toFixed(2)}</div>
                  <div style="color: ${order.balance_amount > 0 ? '#dc2626' : order.balance_amount < 0 ? '#059669' : '#666'}; font-weight: bold;">
                    ${order.balance_amount > 0 
                      ? `₹${order.balance_amount.toFixed(2)} Due` 
                      : order.balance_amount < 0 
                        ? `₹${Math.abs(order.balance_amount).toFixed(2)} Advance` 
                        : 'Fully Paid'
                    }
                  </div>
                </div>
              </div>
            </div>
            
            <div style="padding: 15px;">
              ${config.includeItemDetails ? `
                <h4 style="margin: 0 0 10px 0; color: #333;">Order Items</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                  <thead>
                    <tr style="background: #f8f9fa;">
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Vegetable</th>
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${getOrderItemsHtml(order)}
                  </tbody>
                </table>
              ` : ''}
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8f9fa; padding: 15px; border-radius: 5px;">
                <div>
                  <h5 style="margin: 0 0 10px 0; color: #333;">Order Summary</h5>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 14px;">
                    <span>Total Amount:</span>
                    <span style="font-weight: bold;">₹${order.total_amount.toFixed(2)}</span>
                    <span>Paid Amount:</span>
                    <span style="color: #059669;">₹${order.paid_amount.toFixed(2)}</span>
                    <span>Balance:</span>
                    <span style="color: ${order.balance_amount > 0 ? '#dc2626' : '#059669'}; font-weight: bold;">
                      ₹${order.balance_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h5 style="margin: 0 0 10px 0; color: #333;">Payment Details</h5>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 14px;">
                    <span>Payment Method:</span>
                    <span style="text-transform: uppercase;">${order.payment_method || 'CASH'}</span>
                    <span>Payment Status:</span>
                    <span style="color: ${
                      order.payment_status === 'paid' ? '#059669' : 
                      order.payment_status === 'partial' ? '#d97706' : '#dc2626'
                    }; font-weight: bold; text-transform: uppercase;">
                      ${order.payment_status || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join('');
      }
      
      return html;
    };
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Report - ${customer.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #22c55e; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .logo { 
              width: 80px; 
              height: 80px; 
              margin: 0 auto 15px auto; 
              display: block; 
              border-radius: 8px;
            }
            .company-name { 
              color: #22c55e; 
              font-size: 28px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              color: #666;
              margin-bottom: 10px;
            }
            .customer-info { 
              background: #f0f9ff; 
              padding: 20px; 
              border-radius: 10px; 
              margin-bottom: 30px;
              border-left: 5px solid #22c55e;
              page-break-inside: avoid;
            }
            .customer-info h2 {
              color: #22c55e;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 10px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
            }
            .analytics-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 20px; 
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .analytics-card { 
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              padding: 20px; 
              border-radius: 10px; 
              text-align: center;
              border: 1px solid #bae6fd;
            }
            .analytics-card h3 { 
              margin: 0 0 10px 0; 
              color: #0369a1;
              font-size: 14px;
            }
            .analytics-card .value { 
              font-size: 24px; 
              font-weight: bold; 
              color: #22c55e; 
            }
            .balance-status { 
              padding: 15px; 
              border-radius: 8px; 
              margin: 20px 0; 
              text-align: center; 
              font-weight: bold;
              font-size: 16px;
              page-break-inside: avoid;
            }
            .balance-positive { 
              background: #fee2e2; 
              color: #dc2626; 
              border: 1px solid #fecaca;
            }
            .balance-zero { 
              background: #d1fae5; 
              color: #059669; 
              border: 1px solid #a7f3d0;
            }
            .balance-negative { 
              background: #dbeafe; 
              color: #2563eb; 
              border: 1px solid #93c5fd;
            }
            .orders-section {
              margin-top: 40px;
            }
            .orders-section h3 {
              color: #22c55e;
              font-size: 20px;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #22c55e;
            }
            .qr-section {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              margin: 30px 0;
              text-align: center;
              page-break-inside: avoid;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .qr-item {
              text-align: center;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
            }
            .qr-item h3 {
              margin-bottom: 15px;
              color: #333;
            }
            .qr-company-name {
              font-weight: bold;
              color: #22c55e;
              margin-top: 10px;
            }
            @media print { 
              body { margin: 0; }
              .page-break { page-break-before: always; }
              .orders-section { page-break-before: always; }
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #666;
              text-align: center;
              page-break-inside: avoid;
            }
            ${config.pageBreakAfterAnalytics ? '.analytics-grid { page-break-after: always; }' : ''}
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/lovable-uploads/8fa965fb-6405-4e65-ba32-8efd8d8ef4ed.png" alt="Lord Ganesha Logo" class="logo" />
            <div class="company-name">${config.companyName}</div>
            <div class="report-title">Detailed Customer Business Report</div>
            <div style="font-size: 14px; color: #666;">Generated on ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="customer-info">
            <h2>Customer Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <strong>Name:</strong>
                <span>${customer.name}</span>
              </div>
              <div class="info-item">
                <strong>Mobile:</strong>
                <span>${customer.mobile}</span>
              </div>
              ${customer.shop_name ? `
                <div class="info-item">
                  <strong>Shop:</strong>
                  <span>${customer.shop_name}</span>
                </div>
              ` : ''}
              ${customer.location ? `
                <div class="info-item">
                  <strong>Location:</strong>
                  <span>${customer.location}</span>
                </div>
              ` : ''}
              <div class="info-item">
                <strong>Customer Code:</strong>
                <span>${customer.qr_code}</span>
              </div>
              <div class="info-item">
                <strong>Total Orders:</strong>
                <span>${customerOrders.length}</span>
              </div>
            </div>
          </div>
          
          <div class="analytics-grid">
            <div class="analytics-card">
              <h3>Monthly Business</h3>
              <div class="value">₹${analytics.monthlyTotal.toFixed(2)}</div>
            </div>
            <div class="analytics-card">
              <h3>Yearly Business</h3>
              <div class="value">₹${analytics.yearlyTotal.toFixed(2)}</div>
            </div>
            <div class="analytics-card">
              <h3>Total Orders</h3>
              <div class="value">${analytics.totalOrders}</div>
            </div>
            <div class="analytics-card">
              <h3>Total Business</h3>
              <div class="value">₹${customerOrders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}</div>
            </div>
          </div>
          
          <div class="balance-status ${analytics.totalBalance === 0 ? 'balance-zero' : analytics.totalBalance > 0 ? 'balance-positive' : 'balance-negative'}">
            ${analytics.totalBalance === 0 
              ? '✅ No Outstanding Balance - All payments are up to date' 
              : analytics.totalBalance > 0 
                ? `⚠️ Outstanding Amount: ₹${analytics.totalBalance.toFixed(2)} - Payment pending` 
                : `💰 Advance Amount: ₹${Math.abs(analytics.totalBalance).toFixed(2)} - Credit available`
            }
          </div>
          
          ${analytics.totalBalance > 0 ? `
            <div class="qr-grid">
              <div class="qr-item">
                <h3>Pay Outstanding Balance</h3>
                <img src="${generateUPIQRCode(analytics.totalBalance)}" alt="UPI Payment QR Code" style="width: 200px; height: 200px;">
                ${config.showUpiId ? `
                  <p><strong>UPI ID:</strong> chowdaryindianbank@ybl</p>
                ` : `
                  <div class="qr-company-name">${config.companyName}</div>
                `}
                <p><strong>Amount:</strong> ₹${analytics.totalBalance.toFixed(2)}</p>
              </div>
              <div class="qr-item">
                <h3>Access Your Orders</h3>
                <img src="${generateCustomerPageQR()}" alt="Customer Page QR Code" style="width: 200px; height: 200px;">
                <div class="qr-company-name">${config.companyName}</div>
                <p><strong>Scan to access your customer page</strong></p>
              </div>
            </div>
          ` : `
            <div class="qr-section">
              <h3>📱 Access Your Customer Page</h3>
              <img src="${generateCustomerPageQR()}" alt="Customer Page QR Code" style="width: 200px; height: 200px;">
              <div class="qr-company-name">${config.companyName}</div>
              <p><strong>Scan to view orders and place new orders easily</strong></p>
            </div>
          `}
          
          <div class="orders-section">
            <h3>📋 Detailed Order History (${customerOrders.length} Orders)</h3>
            ${getOrdersHtml()}
          </div>
          
          <div class="footer">
            <div><strong>${config.companyName}</strong></div>
            <div>Fresh Vegetables • Quality Service • Trusted Business Partner</div>
            <div>Report Generated: ${new Date().toLocaleString()} | Customer ID: ${customer.id.substring(0, 8)}</div>
            ${config.customNote ? `<div style="margin-top: 10px; font-style: italic;">${config.customNote}</div>` : ''}
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate PDF Report</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p>Generate a comprehensive business report for <strong>{customer.name}</strong>:</p>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Orders Found:</strong> {customerOrders.length} orders
            </p>
            <p className="text-sm text-blue-600">
              Choose between quick generation or customize your report layout.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={() => generatePDF()} 
              className="flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Quick Generate PDF
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowEditor(true)}
              className="flex items-center justify-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Customize & Edit Report
            </Button>
            
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {showEditor && (
        <CustomerPDFEditor
          customer={customer}
          analytics={analytics}
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          onGenerate={(sections, customizations) => {
            generatePDF(sections, customizations);
            setShowEditor(false);
          }}
        />
      )}
    </Dialog>
  );
};

export default CustomerPDFReport;
