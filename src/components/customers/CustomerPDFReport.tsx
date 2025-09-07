import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { useOrders, useVegetables, usePayments } from "@/hooks/use-supabase-data";
import { useSavePDFReport } from "@/hooks/use-pdf-reports";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import ganeshaLogo from "@/assets/ganesha-logo.png";

interface CustomerPDFReportProps {
  customer: Customer;
  analytics: any;
  onClose: () => void;
}

const CustomerPDFReport: React.FC<CustomerPDFReportProps> = ({ customer, analytics, onClose }) => {
  const { data: orders = [] } = useOrders();
  const { data: vegetables = [] } = useVegetables();
  const { data: allPayments = [] } = usePayments();
  const { toast } = useToast();
  const savePDFReport = useSavePDFReport();
  
  // Filter orders for this customer and sort by date
  const customerOrders = orders
    .filter(order => order.customer_id === customer.id)
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

  // Filter old balance payments (payments without order_id)
  const oldBalancePayments = allPayments.filter(payment => 
    payment.customer_id === customer.id && !payment.order_id
  );

  // Calculate balances correctly
  const currentOrdersBalance = customerOrders.reduce((sum, order) => sum + (order.total_amount - order.paid_amount), 0);
  const totalOldBalancePayments = oldBalancePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingOldBalance = Math.max(0, (customer.old_balance || 0) - totalOldBalancePayments);
  const totalOutstandingBalance = currentOrdersBalance + remainingOldBalance;

  const generateCustomerPageQR = () => {
    const customerUrl = `${window.location.origin}/customer/${customer.qr_code}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(customerUrl)}`;
  };

  const generateUPIQRCode = (amount: number) => {
    const upiId = "chowdaryindianbank@ybl";
    const upiString = `upi://pay?pa=${upiId}&pn=SHREE%20GANESHA%20GREEN%20LEAFY%20VEGETABLES&am=${amount}&cu=INR&tn=Customer%20${customer.qr_code}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  };

  const getOrderItemsHtml = (order: any) => {
    if (!order.order_items || order.order_items.length === 0) {
      return '<tr><td colspan="5" style="text-align: center; color: #666;">No items found</td></tr>';
    }
    
    return order.order_items.map((item: any) => {
      const vegetable = vegetables.find(v => v.id === item.vegetable_id);
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
            ${vegetable?.photo_url ? 
              `<img src="${vegetable.photo_url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" alt="${vegetable.name}" />` 
              : '<div style="width: 40px; height: 40px; background: #f0f0f0; border-radius: 4px; display: inline-block;"></div>'
            }
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${vegetable?.name || 'Unknown Vegetable'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity} ${vegetable?.unit || 'units'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${item.unit_price.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${item.total_price.toFixed(2)}</td>
        </tr>
      `;
    }).join('');
  };

  const getOldBalancePaymentsHtml = () => {
    if (oldBalancePayments.length === 0) {
      return '<div style="text-align: center; color: #666; padding: 20px;">No old balance payments recorded.</div>';
    }

    return `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Payment Date</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Amount</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Method</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${oldBalancePayments.map(payment => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${format(new Date(payment.payment_date), "dd/MM/yyyy")}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; color: #059669; font-weight: bold;">₹${payment.amount.toFixed(2)}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-transform: uppercase;">${payment.payment_method}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${payment.notes || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  const getOrdersHtml = () => {
    if (customerOrders.length === 0) {
      return '<div style="text-align: center; color: #666; padding: 20px;">No orders found for this customer.</div>';
    }

    let ordersHtml = '';
    let currentPageHeight = 0;
    const maxPageHeight = 900;
    
    customerOrders.forEach((order, index) => {
      const orderHeight = 250 + (order.order_items?.length || 0) * 50;
      
      if (currentPageHeight + orderHeight > maxPageHeight && index > 0) {
        ordersHtml += '<div class="page-break"></div>';
        currentPageHeight = 0;
      }
      
      ordersHtml += `
        <div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; break-inside: avoid;">
          <div style="background: #f9fafb; padding: 15px; border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 16px;">Order #SGLV-${order.id.slice(-4)}</strong>
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
            <h4 style="margin: 0 0 10px 0; color: #333;">Order Items with Images</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Image</th>
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
                  <span>Order Created:</span>
                  <span>${order.created_at ? format(new Date(order.created_at), "dd/MM/yyyy 'at' HH:mm") : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      currentPageHeight += orderHeight;
    });
    
    return ordersHtml;
  };

  const generatePDF = async () => {
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
              width: 200px; 
              height: 200px; 
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
              break-inside: avoid;
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
              break-inside: avoid;
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
            .balance-section { 
              background: #f8f9fa;
              padding: 20px; 
              border-radius: 10px; 
              margin: 30px 0; 
              border-left: 5px solid #22c55e;
              break-inside: avoid;
            }
            .balance-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin: 15px 0;
            }
            .balance-item {
              text-align: center;
              padding: 15px;
              background: white;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .balance-status { 
              padding: 15px; 
              border-radius: 8px; 
              margin: 20px 0; 
              text-align: center; 
              font-weight: bold;
              font-size: 16px;
              break-inside: avoid;
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
              break-inside: avoid;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin: 30px 0;
            }
            .qr-item {
              text-align: center;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              break-inside: avoid;
            }
            .page-break { 
              page-break-before: always; 
            }
            @media print { 
              body { margin: 0; }
              .page-break { page-break-before: always; }
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src={ganeshaLogo} alt="Lord Ganesha Logo" class="logo" />
            <div class="company-name">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
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

          <div class="balance-section">
            <h2>Balance Information</h2>
            <div class="balance-grid">
              <div class="balance-item">
                <div style="font-size: 18px; font-weight: bold; color: #d97706;">₹${(customer.old_balance || 0).toFixed(2)}</div>
                <div style="font-size: 12px; color: #92400e;">Original Old Balance</div>
              </div>
              <div class="balance-item">
                <div style="font-size: 18px; font-weight: bold; color: #059669;">₹${totalOldBalancePayments.toFixed(2)}</div>
                <div style="font-size: 12px; color: #047857;">Old Balance Payments</div>
              </div>
              <div class="balance-item">
                <div style="font-size: 18px; font-weight: bold; color: #dc2626;">₹${remainingOldBalance.toFixed(2)}</div>
                <div style="font-size: 12px; color: #991b1b;">Remaining Old Balance</div>
              </div>
              <div class="balance-item">
                <div style="font-size: 18px; font-weight: bold; color: #2563eb;">₹${currentOrdersBalance.toFixed(2)}</div>
                <div style="font-size: 12px; color: #1d4ed8;">Current Orders Balance</div>
              </div>
              <div class="balance-item">
                <div style="font-size: 20px; font-weight: bold; color: ${totalOutstandingBalance > 0 ? '#dc2626' : totalOutstandingBalance < 0 ? '#059669' : '#666'};">
                  ₹${totalOutstandingBalance.toFixed(2)}
                </div>
                <div style="font-size: 12px; color: #666;">Total Outstanding Balance</div>
              </div>
            </div>
          </div>

          ${oldBalancePayments.length > 0 ? `
            <div class="orders-section">
              <h3>📋 Old Balance Payment History (${oldBalancePayments.length} Payments)</h3>
              ${getOldBalancePaymentsHtml()}
            </div>
          ` : ''}
          
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
          
          <div class="balance-status ${totalOutstandingBalance === 0 ? 'balance-zero' : totalOutstandingBalance > 0 ? 'balance-positive' : 'balance-negative'}">
            ${totalOutstandingBalance === 0 
              ? '✅ No Outstanding Balance - All payments are up to date' 
              : totalOutstandingBalance > 0 
                ? `⚠️ Outstanding Amount: ₹${totalOutstandingBalance.toFixed(2)} - Payment pending` 
                : `💰 Advance Amount: ₹${Math.abs(totalOutstandingBalance).toFixed(2)} - Credit available`
            }
          </div>
          
          ${totalOutstandingBalance > 0 ? `
            <div class="qr-grid">
              <div class="qr-item">
                <h3>Pay Outstanding Balance</h3>
                <img src="${generateUPIQRCode(totalOutstandingBalance)}" alt="UPI Payment QR Code" style="width: 200px; height: 200px;">
                <p><strong>SHREE GANESHA GREEN LEAFY VEGETABLES</strong></p>
                <p><strong>Amount:</strong> ₹${totalOutstandingBalance.toFixed(2)}</p>
              </div>
              <div class="qr-item">
                <h3>Access Your Orders</h3>
                <img src="${generateCustomerPageQR()}" alt="Customer Page QR Code" style="width: 200px; height: 200px;">
                <p><strong>View Orders & Place New Orders</strong></p>
                <p>Scan to access your customer page</p>
              </div>
            </div>
          ` : `
            <div class="qr-section">
              <h3>📱 Access Your Customer Page</h3>
              <img src="${generateCustomerPageQR()}" alt="Customer Page QR Code" style="width: 200px; height: 200px;">
              <p><strong>Scan to view orders and place new orders easily</strong></p>
            </div>
          `}
          
          <div class="orders-section">
            <h3>📋 Detailed Order History with Product Images (${customerOrders.length} Orders)</h3>
            ${getOrdersHtml()}
          </div>
          
          <div class="footer">
            <div><strong>SHREE GANESHA GREEN LEAFY VEGETABLES</strong></div>
            <div>Fresh Vegetables • Quality Service • Trusted Business Partner</div>
            <div>Report Generated: ${new Date().toLocaleString()} | Customer ID: ${customer.id.substring(0, 8)}</div>
          </div>
        </body>
      </html>
    `;

    try {
      // Save PDF to Supabase database and storage
      await savePDFReport.mutateAsync({
        customerId: customer.id,
        customerQRCode: customer.qr_code || customer.id.substring(0, 8),
        htmlContent,
        reportType: 'customer_report'
      });

      toast({
        title: "PDF Report Generated & Saved",
        description: `Report saved to customer folder: ${customer.name}`,
      });

      // Open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error saving PDF:', error);
      toast({
        variant: "destructive",
        title: "PDF Save Failed",
        description: "Failed to save PDF report, but you can still print it",
      });

      // Still allow printing even if save fails
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Enhanced PDF Report</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p>Generate a comprehensive business report for <strong>{customer.name}</strong> including:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Complete customer information with photos</li>
            <li>Fixed old balance and payment calculations</li>
            <li>Detailed old balance tracking and payment history</li>
            <li>Current orders balance vs old balance breakdown</li>
            <li>Detailed order history with product images</li>
            <li>Individual order items with vegetable photos</li>
            <li>Payment details and status tracking</li>
            <li>Outstanding balance with UPI payment QR</li>
            <li>Customer access QR code</li>
            <li>Professional pagination (no content breaking)</li>
            <li>Automatic save to Supabase database in customer folder</li>
          </ul>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Orders Found:</strong> {customerOrders.length} orders
              <br />
              <strong>Old Balance Payments:</strong> {oldBalancePayments.length} payments
              <br />
              <strong>Total Outstanding:</strong> ₹{totalOutstandingBalance.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Fixed Balance Calculations:</strong>
            </p>
            <ul className="text-xs text-green-600 list-disc ml-4">
              <li>Current orders balance: ₹{currentOrdersBalance.toFixed(2)}</li>
              <li>Remaining old balance: ₹{remainingOldBalance.toFixed(2)}</li>
              <li>Old balance payments applied: ₹{totalOldBalancePayments.toFixed(2)}</li>
              <li>Total outstanding: ₹{totalOutstandingBalance.toFixed(2)}</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={generatePDF} 
              className="flex-1"
              disabled={savePDFReport.isPending}
            >
              {savePDFReport.isPending ? 'Saving...' : 'Generate & Save PDF Report'}
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

export default CustomerPDFReport;
