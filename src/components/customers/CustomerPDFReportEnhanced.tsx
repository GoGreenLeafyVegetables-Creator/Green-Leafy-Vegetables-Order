import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { Settings, FileText, ExternalLink } from "lucide-react";
import { usePDFStorage } from "@/hooks/use-pdf-storage";
import { useToast } from "@/components/ui/use-toast";
import { useVegetables } from "@/hooks/use-supabase-data";

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
  const { savePDFToStorage } = usePDFStorage();
  const { toast } = useToast();
  const { data: vegetables } = useVegetables();

  const openPDFEditor = () => {
    // Open the PDF editor in the same tab instead of a new window
    window.location.href = `/pdf-editor/${customer.id}`;
  };

  const getVegetableImage = (vegetableId: string) => {
    const vegetable = vegetables?.find(v => v.id === vegetableId);
    return vegetable?.photo_url || '/placeholder.svg';
  };

  const getVegetableName = (vegetableId: string) => {
    const vegetable = vegetables?.find(v => v.id === vegetableId);
    return vegetable?.name || 'Unknown Vegetable';
  };

  const generateQuickPDF = async () => {
    try {
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
              .section { 
                margin-bottom: 30px; 
                page-break-inside: avoid; 
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
                border-left: 5px solid #22c55e;
              }
              .analytics-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 20px; 
                margin: 30px 0;
              }
              .analytics-card { 
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                padding: 20px; 
                border-radius: 10px; 
                text-align: center;
                border: 1px solid #bae6fd;
              }
              .order-history {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin: 30px 0;
              }
              .order-item {
                display: flex;
                align-items: center;
                padding: 15px;
                margin-bottom: 10px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                page-break-inside: avoid;
              }
              .vegetable-image {
                width: 60px;
                height: 60px;
                border-radius: 8px;
                margin-right: 15px;
                object-fit: cover;
                border: 2px solid #22c55e;
              }
              .order-details {
                flex: 1;
              }
              .qr-section {
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
              .company-name-small {
                font-weight: bold;
                color: #22c55e;
                margin-top: 10px;
                font-size: 14px;
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
              @media print { 
                body { margin: 0; }
                .section { page-break-inside: avoid; }
                .order-item { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="section header">
              <img src="/lovable-uploads/8fa965fb-6405-4e65-ba32-8efd8d8ef4ed.png" alt="Lord Ganesha Logo" style="width: 80px; height: 80px; margin: 0 auto 15px auto; display: block; border-radius: 8px;" />
              <div class="company-name">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
              <div style="font-size: 18px; color: #666; margin-bottom: 10px;">Detailed Customer Business Report</div>
              <div style="font-size: 14px; color: #666;">Generated on ${new Date().toLocaleString()}</div>
            </div>
            
            <div class="section customer-info">
              <h2 style="color: #22c55e; margin-top: 0; margin-bottom: 15px;">Customer Information</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                <div style="display: flex; justify-content: space-between;"><strong>Name:</strong><span>${customer.name}</span></div>
                <div style="display: flex; justify-content: space-between;"><strong>Mobile:</strong><span>${customer.mobile}</span></div>
                ${customer.shop_name ? `<div style="display: flex; justify-content: space-between;"><strong>Shop:</strong><span>${customer.shop_name}</span></div>` : ''}
                ${customer.location ? `<div style="display: flex; justify-content: space-between;"><strong>Location:</strong><span>${customer.location}</span></div>` : ''}
                <div style="display: flex; justify-content: space-between;"><strong>Customer Code:</strong><span>${customer.qr_code}</span></div>
              </div>
            </div>
            
            <div class="section analytics-grid">
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

            ${analytics.orders?.length > 0 ? `
              <div class="section order-history">
                <h2 style="color: #22c55e; margin-top: 0;">Recent Order History with Items</h2>
                ${analytics.orders.slice(0, 10).map((order: any) => `
                  <div style="margin-bottom: 25px; background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                      <strong style="color: #22c55e;">Order Date: ${new Date(order.order_date).toLocaleDateString()}</strong>
                      <strong style="color: #22c55e;">Total: ₹${order.total_amount.toFixed(2)}</strong>
                    </div>
                    ${order.order_items?.map((item: any) => `
                      <div class="order-item">
                        <img src="${getVegetableImage(item.vegetable_id)}" alt="${getVegetableName(item.vegetable_id)}" class="vegetable-image" />
                        <div class="order-details">
                          <div style="font-weight: bold; color: #333; margin-bottom: 5px;">${getVegetableName(item.vegetable_id)}</div>
                          <div style="color: #666; font-size: 14px;">Quantity: ${item.quantity} ${item.vegetables?.unit || 'units'}</div>
                          <div style="color: #666; font-size: 14px;">Rate: ₹${item.unit_price} | Total: ₹${item.total_price.toFixed(2)}</div>
                        </div>
                      </div>
                    `).join('') || ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${analytics.totalBalance > 0 ? `
              <div class="section qr-section">
                <div class="qr-item">
                  <h3>Pay Outstanding Balance</h3>
                  <img src="${generateUPIQRCode(analytics.totalBalance)}" alt="UPI Payment QR Code" style="width: 200px; height: 200px;">
                  <div class="company-name-small">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
                  <p><strong>Amount:</strong> ₹${analytics.totalBalance.toFixed(2)}</p>
                </div>
                <div class="qr-item">
                  <h3>Access Your Orders</h3>
                  <img src="${generateCustomerPageQR()}" alt="Customer Page QR Code" style="width: 200px; height: 200px;">
                  <div class="company-name-small">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
                  <p><strong>Scan to access your customer page</strong></p>
                </div>
              </div>
            ` : `
              <div class="section qr-section" style="justify-content: center;">
                <div class="qr-item">
                  <h3>📱 Access Your Customer Page</h3>
                  <img src="${generateCustomerPageQR()}" alt="Customer Page QR Code" style="width: 200px; height: 200px;">
                  <div class="company-name-small">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
                  <p><strong>Scan to view orders and place new orders easily</strong></p>
                </div>
              </div>
            `}
            
            <div class="section footer">
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
      
      // Save to storage
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const filename = `${customer.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.html`;
      await savePDFToStorage(customer.id, blob, filename);
      
      printWindow.print();
      
      toast({
        title: "PDF Generated & Saved",
        description: "Customer report has been generated and saved to secure storage.",
      });
      
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF report.",
      });
    }
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
            <h4 className="font-semibold text-blue-800 mb-2">✨ Enhanced Features:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Vegetable images in order details</li>
              <li>• Advanced PDF editor with drag & drop</li>
              <li>• Auto-save reports to customer folders</li>
              <li>• Customizable sections and layouts</li>
              <li>• Page-break optimization</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={openPDFEditor}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Settings className="h-4 w-4" />
              Open Advanced PDF Editor
            </Button>
            
            <Button 
              variant="outline"
              onClick={generateQuickPDF} 
              className="flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Quick Generate & Save PDF
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
