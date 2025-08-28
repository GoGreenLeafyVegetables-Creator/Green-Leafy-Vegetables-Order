import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "@/types/customer";
import { useOrders, useVegetables } from "@/hooks/use-supabase-data";
import { format } from "date-fns";
import { FileText, Save, Printer, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface PDFSection {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  content?: string;
}

interface CustomerPDFEditorPageProps {
  customer: Customer;
  analytics: any;
}

const CustomerPDFEditorPage: React.FC<CustomerPDFEditorPageProps> = ({
  customer,
  analytics,
}) => {
  const { data: orders = [] } = useOrders();
  const { data: vegetables = [] } = useVegetables();
  const { toast } = useToast();

  const [sections, setSections] = useState<PDFSection[]>([
    { id: 'header', title: 'Company Header', enabled: true, order: 1 },
    { id: 'customer-info', title: 'Customer Information', enabled: true, order: 2 },
    { id: 'analytics', title: 'Business Analytics', enabled: true, order: 3 },
    { id: 'balance', title: 'Balance Status', enabled: true, order: 4 },
    { id: 'qr-codes', title: 'QR Codes', enabled: true, order: 5 },
    { id: 'orders', title: 'Order History with Images', enabled: true, order: 6 },
  ]);

  const [customizations, setCustomizations] = useState({
    companyName: 'SHREE GANESHA GREEN LEAFY VEGETABLES',
    showUpiId: false,
    pageBreakAfterAnalytics: false,
    ordersPerPage: 2,
    includeItemDetails: true,
    includeItemImages: true,
    customNote: '',
    showItemImages: true,
  });

  const customerOrders = orders
    .filter(order => order.customer_id === customer.id)
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

  const handleSectionToggle = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, enabled: !section.enabled }
        : section
    ));
  };

  const moveSectionUp = (sectionId: string) => {
    setSections(prev => {
      const newSections = [...prev];
      const index = newSections.findIndex(s => s.id === sectionId);
      if (index > 0) {
        [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        newSections.forEach((section, idx) => {
          section.order = idx + 1;
        });
      }
      return newSections;
    });
  };

  const moveSectionDown = (sectionId: string) => {
    setSections(prev => {
      const newSections = [...prev];
      const index = newSections.findIndex(s => s.id === sectionId);
      if (index < newSections.length - 1) {
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        newSections.forEach((section, idx) => {
          section.order = idx + 1;
        });
      }
      return newSections;
    });
  };

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
    if (!customizations.includeItemDetails || !order.order_items || order.order_items.length === 0) {
      return '<tr><td colspan="5" style="text-align: center; color: #666; padding: 15px;">Item details not included</td></tr>';
    }
    
    return order.order_items.map((item: any) => {
      const vegetable = vegetables.find(v => v.id === item.vegetable_id);
      return `
        <tr>
          ${customizations.includeItemImages ? `
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
              ${vegetable?.photo_url ? `
                <img src="${vegetable.photo_url}" alt="${vegetable?.name || 'Vegetable'}" 
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;" />
              ` : `
                <div style="width: 60px; height: 60px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666;">No Image</div>
              `}
            </td>
          ` : ''}
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${vegetable?.name || 'Unknown Vegetable'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity} ${vegetable?.unit || 'units'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${item.unit_price.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${item.total_price.toFixed(2)}</td>
        </tr>
      `;
    }).join('');
  };

  const savePDFToSupabase = async (htmlContent: string) => {
    try {
      const fileName = `customer_report_${customer.qr_code}_${new Date().toISOString().split('T')[0]}.html`;
      const filePath = `${customer.id}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('customer-reports')
        .upload(filePath, new Blob([htmlContent], { type: 'text/html' }), {
          upsert: true
        });

      if (error) throw error;

      toast({
        title: "PDF Report Saved",
        description: `Report saved successfully for ${customer.name}`,
      });

      return filePath;
    } catch (error) {
      console.error('Error saving PDF to Supabase:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save PDF report. Please try again.",
      });
      return null;
    }
  };

  const generatePDF = async () => {
    const enabledSections = sections
      .filter(section => section.enabled)
      .sort((a, b) => a.order - b.order);

    const getOrdersHtml = () => {
      if (customerOrders.length === 0) {
        return '<div style="text-align: center; color: #666; padding: 40px;">No orders found for this customer.</div>';
      }

      const ordersPerPage = customizations.ordersPerPage;
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
              ${customizations.includeItemDetails ? `
                <h4 style="margin: 0 0 10px 0; color: #333;">Order Items</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                  <thead>
                    <tr style="background: #f8f9fa;">
                      ${customizations.includeItemImages ? '<th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Image</th>' : ''}
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
    
    let htmlContent = `
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
            .page-break { page-break-before: always; }
            @media print { 
              body { margin: 0; }
              .page-break { page-break-before: always; }
            }
            ${customizations.pageBreakAfterAnalytics ? '.analytics-grid { page-break-after: always; }' : ''}
          </style>
        </head>
        <body>
    `;

    enabledSections.forEach(section => {
      switch (section.id) {
        case 'header':
          htmlContent += `
            <div class="header" style="text-align: center; border-bottom: 3px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px;">
              <img src="/lovable-uploads/8fa965fb-6405-4e65-ba32-8efd8d8ef4ed.png" alt="Lord Ganesha Logo" style="width: 80px; height: 80px; margin: 0 auto 15px auto; display: block; border-radius: 8px;" />
              <div style="color: #22c55e; font-size: 28px; font-weight: bold; margin-bottom: 5px;">${customizations.companyName}</div>
              <div style="font-size: 18px; color: #666; margin-bottom: 10px;">Detailed Customer Business Report</div>
              <div style="font-size: 14px; color: #666;">Generated on ${new Date().toLocaleString()}</div>
            </div>
          `;
          break;

        case 'customer-info':
          htmlContent += `
            <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin-bottom: 30px; border-left: 5px solid #22c55e; page-break-inside: avoid;">
              <h2 style="color: #22c55e; margin-top: 0; margin-bottom: 15px;">Customer Information</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                <div style="display: flex; justify-content: space-between;"><strong>Name:</strong><span>${customer.name}</span></div>
                <div style="display: flex; justify-content: space-between;"><strong>Mobile:</strong><span>${customer.mobile}</span></div>
                ${customer.shop_name ? `<div style="display: flex; justify-content: space-between;"><strong>Shop:</strong><span>${customer.shop_name}</span></div>` : ''}
                ${customer.location ? `<div style="display: flex; justify-content: space-between;"><strong>Location:</strong><span>${customer.location}</span></div>` : ''}
                <div style="display: flex; justify-content: space-between;"><strong>Customer Code:</strong><span>${customer.qr_code}</span></div>
                <div style="display: flex; justify-content: space-between;"><strong>Total Orders:</strong><span>${customerOrders.length}</span></div>
              </div>
            </div>
          `;
          break;

        case 'analytics':
          htmlContent += `
            <div class="analytics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; page-break-inside: avoid;">
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #bae6fd;">
                <h3 style="margin: 0 0 10px 0; color: #0369a1; font-size: 14px;">Monthly Business</h3>
                <div style="font-size: 24px; font-weight: bold; color: #22c55e;">₹${analytics.monthlyTotal.toFixed(2)}</div>
              </div>
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #bae6fd;">
                <h3 style="margin: 0 0 10px 0; color: #0369a1; font-size: 14px;">Yearly Business</h3>
                <div style="font-size: 24px; font-weight: bold; color: #22c55e;">₹${analytics.yearlyTotal.toFixed(2)}</div>
              </div>
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #bae6fd;">
                <h3 style="margin: 0 0 10px 0; color: #0369a1; font-size: 14px;">Total Orders</h3>
                <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${analytics.totalOrders}</div>
              </div>
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #bae6fd;">
                <h3 style="margin: 0 0 10px 0; color: #0369a1; font-size: 14px;">Total Business</h3>
                <div style="font-size: 24px; font-weight: bold; color: #22c55e;">₹${customerOrders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}</div>
              </div>
            </div>
          `;
          break;

        case 'balance':
          htmlContent += `
            <div style="padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; font-size: 16px; page-break-inside: avoid; ${analytics.totalBalance === 0 ? 'background: #d1fae5; color: #059669; border: 1px solid #a7f3d0;' : analytics.totalBalance > 0 ? 'background: #fee2e2; color: #dc2626; border: 1px solid #fecaca;' : 'background: #dbeafe; color: #2563eb; border: 1px solid #93c5fd;'}">
              ${analytics.totalBalance === 0 
                ? '✅ No Outstanding Balance - All payments are up to date' 
                : analytics.totalBalance > 0 
                  ? `⚠️ Outstanding Amount: ₹${analytics.totalBalance.toFixed(2)} - Payment pending` 
                  : `💰 Advance Amount: ₹${Math.abs(analytics.totalBalance).toFixed(2)} - Credit available`
              }
            </div>
          `;
          break;

        case 'qr-codes':
          if (analytics.totalBalance > 0) {
            htmlContent += `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; page-break-inside: avoid;">
                <div style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 10px;">
                  <h3 style="margin-bottom: 15px; color: #333;">Pay Outstanding Balance</h3>
                  <img src="${generateUPIQRCode(analytics.totalBalance)}" alt="UPI Payment QR Code" style="width: 200px; height: 200px;">
                  <div style="font-weight: bold; color: #22c55e; margin-top: 10px;">${customizations.companyName}</div>
                  <p><strong>Amount:</strong> ₹${analytics.totalBalance.toFixed(2)}</p>
                </div>
                <div style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 10px;">
                  <h3 style="margin-bottom: 15px; color: #333;">Access Your Orders</h3>
                  <img src="${generateCustomerPageQR()}" alt="Customer Page QR Code" style="width: 200px; height: 200px;">
                  <div style="font-weight: bold; color: #22c55e; margin-top: 10px;">${customizations.companyName}</div>
                  <p><strong>Scan to access your customer page</strong></p>
                </div>
              </div>
            `;
          } else {
            htmlContent += `
              <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 30px 0; text-align: center; page-break-inside: avoid;">
                <h3>📱 Access Your Customer Page</h3>
                <img src="${generateCustomerPageQR()}" alt="Customer Page QR Code" style="width: 200px; height: 200px;">
                <div style="font-weight: bold; color: #22c55e; margin-top: 10px;">${customizations.companyName}</div>
                <p><strong>Scan to view orders and place new orders easily</strong></p>
              </div>
            `;
          }
          break;

        case 'orders':
          htmlContent += `
            <div class="orders-section" style="margin-top: 40px;">
              <h3 style="color: #22c55e; font-size: 20px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #22c55e;">📋 Detailed Order History (${customerOrders.length} Orders)</h3>
              ${getOrdersHtml()}
            </div>
          `;
          break;
      }
    });

    htmlContent += `
          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; text-align: center; page-break-inside: avoid;">
            <div><strong>${customizations.companyName}</strong></div>
            <div>Fresh Vegetables • Quality Service • Trusted Business Partner</div>
            <div>Report Generated: ${new Date().toLocaleString()} | Customer ID: ${customer.id.substring(0, 8)}</div>
            ${customizations.customNote ? `<div style="margin-top: 10px; font-style: italic;">${customizations.customNote}</div>` : ''}
          </div>
        </body>
      </html>
    `;

    // Save to Supabase first
    await savePDFToSupabase(htmlContent);

    // Then open for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PDF Report Editor - {customer.name}
              </h1>
              <p className="text-gray-600">Customize and edit your PDF report before generating</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={generatePDF} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save & Print PDF
              </Button>
            </div>
          </div>

          <Tabs defaultValue="sections" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sections">Report Sections</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preview">Live Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="space-y-4">
              <div className="grid gap-3">
                <h3 className="font-semibold text-lg">Customize Report Sections</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enable/disable sections and drag to reorder them in your PDF report
                </p>
                
                {sections.map((section, index) => (
                  <Card key={section.id} className={`${section.enabled ? 'bg-white' : 'bg-gray-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch 
                            checked={section.enabled}
                            onCheckedChange={() => handleSectionToggle(section.id)}
                          />
                          <span className="font-medium text-lg">
                            {section.order}. {section.title}
                          </span>
                          {section.id === 'orders' && (
                            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              Includes Vegetable Images
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveSectionUp(section.id)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveSectionDown(section.id)}
                            disabled={index === sections.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={customizations.companyName}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        companyName: e.target.value
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-upi">Show UPI ID below QR code</Label>
                    <Switch
                      id="show-upi"
                      checked={customizations.showUpiId}
                      onCheckedChange={(checked) => setCustomizations(prev => ({
                        ...prev,
                        showUpiId: checked
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-images">Include vegetable images in orders</Label>
                    <Switch
                      id="include-images"
                      checked={customizations.includeItemImages}
                      onCheckedChange={(checked) => setCustomizations(prev => ({
                        ...prev,
                        includeItemImages: checked
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="orders-per-page">Orders per page (max)</Label>
                    <Input
                      id="orders-per-page"
                      type="number"
                      min="1"
                      max="5"
                      value={customizations.ordersPerPage}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        ordersPerPage: parseInt(e.target.value) || 2
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="item-details">Include item details in orders</Label>
                    <Switch
                      id="item-details"
                      checked={customizations.includeItemDetails}
                      onCheckedChange={(checked) => setCustomizations(prev => ({
                        ...prev,
                        includeItemDetails: checked
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom-note">Custom note (footer)</Label>
                    <Textarea
                      id="custom-note"
                      value={customizations.customNote}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        customNote: e.target.value
                      }))}
                      placeholder="Add any custom message for the footer..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Live Report Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-6 bg-white min-h-[600px] max-h-[800px] overflow-y-auto">
                    <div className="space-y-6 text-sm">
                      {sections
                        .filter(section => section.enabled)
                        .sort((a, b) => a.order - b.order)
                        .map((section, index) => (
                          <div key={section.id} className="border-b pb-4">
                            <div className="font-semibold text-blue-600 text-base mb-2">
                              {section.order}. {section.title}
                            </div>
                            <div className="text-gray-600 text-sm pl-4">
                              {section.id === 'header' && `Company: ${customizations.companyName}`}
                              {section.id === 'customer-info' && `${customer.name} - ${customer.mobile}`}
                              {section.id === 'analytics' && `Monthly: ₹${analytics.monthlyTotal?.toFixed(2) || '0.00'} | Yearly: ₹${analytics.yearlyTotal?.toFixed(2) || '0.00'}`}
                              {section.id === 'balance' && `Balance: ₹${analytics.totalBalance?.toFixed(2) || '0.00'}`}
                              {section.id === 'qr-codes' && `UPI QR Code + Company Name: ${customizations.companyName}`}
                              {section.id === 'orders' && (
                                <div>
                                  <div>{customerOrders.length} orders with {customizations.includeItemImages ? 'vegetable images' : 'text only'}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {customizations.ordersPerPage} orders per page, {customizations.includeItemDetails ? 'with' : 'without'} item details
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      {customizations.customNote && (
                        <div className="border-b pb-4 border-dashed">
                          <div className="font-semibold text-green-600">Custom Footer Note</div>
                          <div className="text-gray-600 text-sm pl-4">{customizations.customNote}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomerPDFEditorPage;
