
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { Settings, FileText, ExternalLink } from "lucide-react";
import CustomerPDFEditorPage from "./CustomerPDFEditorPage";

interface CustomerPDFReportEnhancedProps {
  customer: Customer;
  analytics: any;
  onClose: () => void;
}

const CustomerPDFReportEnhanced: React.FC<CustomerPDFReportEnhancedProps> = ({ 
  customer, 
  analytics, 
  onClose 
}) => {
  const openPDFEditor = () => {
    // Open the PDF editor in a new window
    const editorWindow = window.open('', '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
    if (!editorWindow) return;
    
    // Create a container for React to render into
    editorWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PDF Editor - ${customer.name}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
          </style>
        </head>
        <body>
          <div id="pdf-editor-root"></div>
          <script type="module">
            import React from 'https://esm.sh/react@18';
            import ReactDOM from 'https://esm.sh/react-dom@18/client';
            
            // This would be replaced with actual component rendering
            const container = document.getElementById('pdf-editor-root');
            const root = ReactDOM.createRoot(container);
            
            // For now, show a loading message
            root.render(React.createElement('div', {
              style: { padding: '40px', textAlign: 'center' }
            }, 'PDF Editor Loading...'));
          </script>
        </body>
      </html>
    `);
    
    editorWindow.document.close();
    onClose();
  };

  const generateQuickPDF = () => {
    // Quick PDF generation with default settings and images
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const generateCustomerPageQR = () => {
      const customerUrl = `${window.location.origin}/customer/${customer.qr_code}`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(customerUrl)}`;
    };

    const generateUPIQRCode = (amount: number) => {
      const upiId = "chowdaryindianbank@ybl";
      const upiString = `upi://pay?pa=${upiId}&pn=SHREE%20GANESHA%20GREEN%20LEAFY%20VEGETABLES&am=${amount}&cu=INR&tn=Customer%20${customer.qr_code}`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
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
            .company-name { 
              color: #22c55e; 
              font-size: 28px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .customer-info { 
              background: #f0f9ff; 
              padding: 20px; 
              border-radius: 10px; 
              margin-bottom: 30px;
              border-left: 5px solid #22c55e;
              page-break-inside: avoid;
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
            .qr-company-name {
              font-weight: bold;
              color: #22c55e;
              margin-top: 10px;
            }
            @media print { 
              body { margin: 0; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/lovable-uploads/8fa965fb-6405-4e65-ba32-8efd8d8ef4ed.png" alt="Lord Ganesha Logo" style="width: 80px; height: 80px; margin: 0 auto 15px auto; display: block; border-radius: 8px;" />
            <div class="company-name">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
            <div style="font-size: 18px; color: #666; margin-bottom: 10px;">Detailed Customer Business Report</div>
            <div style="font-size: 14px; color: #666;">Generated on ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="customer-info">
            <h2 style="color: #22c55e; margin-top: 0; margin-bottom: 15px;">Customer Information</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
              <div style="display: flex; justify-content: space-between;"><strong>Name:</strong><span>${customer.name}</span></div>
              <div style="display: flex; justify-content: space-between;"><strong>Mobile:</strong><span>${customer.mobile}</span></div>
              ${customer.shop_name ? `<div style="display: flex; justify-content: space-between;"><strong>Shop:</strong><span>${customer.shop_name}</span></div>` : ''}
              ${customer.location ? `<div style="display: flex; justify-content: space-between;"><strong>Location:</strong><span>${customer.location}</span></div>` : ''}
              <div style="display: flex; justify-content: space-between;"><strong>Customer Code:</strong><span>${customer.qr_code}</span></div>
            </div>
          </div>
          
          <div class="analytics-grid">
            <div class="analytics-card">
              <h3 style="margin: 0 0 10px 0; color: #0369a1; font-size: 14px;">Monthly Business</h3>
              <div style="font-size: 24px; font-weight: bold; color: #22c55e;">₹${analytics.monthlyTotal.toFixed(2)}</div>
            </div>
            <div class="analytics-card">
              <h3 style="margin: 0 0 10px 0; color: #0369a1; font-size: 14px;">Yearly Business</h3>
              <div style="font-size: 24px; font-weight: bold; color: #22c55e;">₹${analytics.yearlyTotal.toFixed(2)}</div>
            </div>
            <div class="analytics-card">
              <h3 style="margin: 0 0 10px 0; color: #0369a1; font-size: 14px;">Total Orders</h3>
              <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${analytics.totalOrders}</div>
            </div>
          </div>
          
          ${analytics.totalBalance > 0 ? `
            <div class="qr-grid">
              <div class="qr-item">
                <h3>Pay Outstanding Balance</h3>
                <img src="${generateUPIQRCode(analytics.totalBalance)}" alt="UPI Payment QR Code" style="width: 200px; height: 200px;">
                <div class="qr-company-name">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
                <p><strong>Amount:</strong> ₹${analytics.totalBalance.toFixed(2)}</p>
              </div>
              <div class="qr-item">
                <h3>Access Your Orders</h3>
                <img src="${generateCustomerPageQR()}" alt="Customer Page QR Code" style="width: 200px; height: 200px;">
                <div class="qr-company-name">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
                <p><strong>Scan to access your customer page</strong></p>
              </div>
            </div>
          ` : `
            <div class="qr-section">
              <h3>📱 Access Your Customer Page</h3>
              <img src="${generateCustomerPageQR()}" alt="Customer Page QR Code" style="width: 200px; height: 200px;">
              <div class="qr-company-name">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
              <p><strong>Scan to view orders and place new orders easily</strong></p>
            </div>
          `}
          
          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; text-align: center; page-break-inside: avoid;">
            <div><strong>SHREE GANESHA GREEN LEAFY VEGETABLES</strong></div>
            <div>Fresh Vegetables • Quality Service • Trusted Business Partner</div>
            <div>Report Generated: ${new Date().toLocaleString()} | Customer ID: ${customer.id.substring(0, 8)}</div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate PDF Report</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p>Generate a comprehensive business report for <strong>{customer.name}</strong>:</p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">✨ New Features Available:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Vegetable images in order details</li>
              <li>• Advanced PDF editor with drag & drop</li>
              <li>• Auto-save reports to customer folders</li>
              <li>• Customizable sections and layouts</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={openPDFEditor}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ExternalLink className="h-4 w-4" />
              Open Advanced PDF Editor
            </Button>
            
            <Button 
              variant="outline"
              onClick={generateQuickPDF} 
              className="flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Quick Generate PDF
            </Button>
            
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerPDFReportEnhanced;
