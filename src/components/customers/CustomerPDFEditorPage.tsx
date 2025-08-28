
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Customer } from '@/types/customer';
import { useVegetables } from '@/hooks/use-supabase-data';
import { usePDFStorage } from '@/hooks/use-pdf-storage';
import { useToast } from '@/components/ui/use-toast';
import { Download, Save, ArrowUp, ArrowDown, Eye, Settings } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface CustomerPDFEditorPageProps {
  customer: Customer;
  analytics: any;
  onClose: () => void;
}

interface PDFSection {
  id: string;
  title: string;
  type: 'header' | 'customer-info' | 'analytics' | 'order-history' | 'qr-codes' | 'footer';
  enabled: boolean;
  customizable: boolean;
}

const CustomerPDFEditorPage: React.FC<CustomerPDFEditorPageProps> = ({ 
  customer, 
  analytics, 
  onClose 
}) => {
  const { data: vegetables } = useVegetables();
  const { savePDFToStorage } = usePDFStorage();
  const { toast } = useToast();
  
  const [sections, setSections] = useState<PDFSection[]>([
    { id: 'header', title: 'Company Header', type: 'header', enabled: true, customizable: false },
    { id: 'customer-info', title: 'Customer Information', type: 'customer-info', enabled: true, customizable: true },
    { id: 'analytics', title: 'Business Analytics', type: 'analytics', enabled: true, customizable: true },
    { id: 'order-history', title: 'Order History with Images', type: 'order-history', enabled: true, customizable: true },
    { id: 'qr-codes', title: 'QR Codes', type: 'qr-codes', enabled: true, customizable: true },
    { id: 'footer', title: 'Footer', type: 'footer', enabled: true, customizable: false }
  ]);

  const [settings, setSettings] = useState({
    includeVegetableImages: true,
    showPriceDetails: true,
    compactLayout: false,
    colorScheme: 'green',
    pageSize: 'A4'
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const generateCustomerPageQR = () => {
    const customerUrl = `${window.location.origin}/customer/${customer.qr_code}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(customerUrl)}`;
  };

  const generateUPIQRCode = (amount: number) => {
    const upiId = "chowdaryindianbank@ybl";
    const upiString = `upi://pay?pa=${upiId}&pn=SHREE%20GANESHA%20GREEN%20LEAFY%20VEGETABLES&am=${amount}&cu=INR&tn=Customer%20${customer.qr_code}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  };

  const getVegetableImage = (vegetableId: string) => {
    const vegetable = vegetables?.find(v => v.id === vegetableId);
    return vegetable?.photo_url || '/placeholder.svg';
  };

  const getVegetableName = (vegetableId: string) => {
    const vegetable = vegetables?.find(v => v.id === vegetableId);
    return vegetable?.name || 'Unknown Vegetable';
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const newSections = Array.from(sections);
    const [reorderedItem] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, reorderedItem);

    setSections(newSections);
  };

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, enabled: !section.enabled }
        : section
    ));
  };

  const generatePDFPreview = () => {
    const enabledSections = sections.filter(s => s.enabled);
    
    return `
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
            }
            .order-item {
              display: flex;
              align-items: center;
              padding: 15px;
              margin-bottom: 10px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .vegetable-image {
              width: 60px;
              height: 60px;
              border-radius: 8px;
              margin-right: 15px;
              object-fit: cover;
            }
            .order-details {
              flex: 1;
            }
            .qr-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              text-align: center;
            }
            .qr-item {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
            }
            .company-name-small {
              font-weight: bold;
              color: #22c55e;
              margin-top: 10px;
              font-size: 12px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            @media print { 
              body { margin: 0; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${enabledSections.map(section => {
            switch(section.type) {
              case 'header':
                return `
                  <div class="section header">
                    <img src="/lovable-uploads/8fa965fb-6405-4e65-ba32-8efd8d8ef4ed.png" alt="Lord Ganesha Logo" style="width: 80px; height: 80px; margin: 0 auto 15px auto; display: block; border-radius: 8px;" />
                    <div class="company-name">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
                    <div style="font-size: 18px; color: #666; margin-bottom: 10px;">Detailed Customer Business Report</div>
                    <div style="font-size: 14px; color: #666;">Generated on ${new Date().toLocaleString()}</div>
                  </div>
                `;
              case 'customer-info':
                return `
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
                `;
              case 'analytics':
                return `
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
                `;
              case 'order-history':
                return `
                  <div class="section order-history">
                    <h2 style="color: #22c55e; margin-top: 0;">Recent Order History</h2>
                    ${analytics.orders?.slice(0, 10).map((order: any) => `
                      <div style="margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                          <strong>Order Date: ${new Date(order.order_date).toLocaleDateString()}</strong>
                          <strong>Total: ₹${order.total_amount.toFixed(2)}</strong>
                        </div>
                        ${order.order_items?.map((item: any) => `
                          <div class="order-item">
                            ${settings.includeVegetableImages ? `<img src="${getVegetableImage(item.vegetable_id)}" alt="${getVegetableName(item.vegetable_id)}" class="vegetable-image" />` : ''}
                            <div class="order-details">
                              <div style="font-weight: bold;">${getVegetableName(item.vegetable_id)}</div>
                              <div>Quantity: ${item.quantity} ${item.vegetables?.unit || 'units'}</div>
                              ${settings.showPriceDetails ? `<div>Rate: ₹${item.unit_price} | Total: ₹${item.total_price}</div>` : ''}
                            </div>
                          </div>
                        `).join('') || ''}
                      </div>
                    `).join('') || ''}
                  </div>
                `;
              case 'qr-codes':
                return `
                  <div class="section qr-section">
                    ${analytics.totalBalance > 0 ? `
                      <div class="qr-item">
                        <h3>Pay Outstanding Balance</h3>
                        <img src="${generateUPIQRCode(analytics.totalBalance)}" alt="UPI Payment QR Code" style="width: 200px; height: 200px;">
                        <div class="company-name-small">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
                        <p><strong>Amount:</strong> ₹${analytics.totalBalance.toFixed(2)}</p>
                      </div>
                    ` : ''}
                    <div class="qr-item">
                      <h3>Access Your Orders</h3>
                      <img src="${generateCustomerPageQR()}" alt="Customer Page QR Code" style="width: 200px; height: 200px;">
                      <div class="company-name-small">SHREE GANESHA GREEN LEAFY VEGETABLES</div>
                      <p><strong>Scan to access your customer page</strong></p>
                    </div>
                  </div>
                `;
              case 'footer':
                return `
                  <div class="section footer">
                    <div><strong>SHREE GANESHA GREEN LEAFY VEGETABLES</strong></div>
                    <div>Fresh Vegetables • Quality Service • Trusted Business Partner</div>
                    <div>Report Generated: ${new Date().toLocaleString()} | Customer ID: ${customer.id.substring(0, 8)}</div>
                  </div>
                `;
              default:
                return '';
            }
          }).join('')}
        </body>
      </html>
    `;
  };

  const savePDF = async () => {
    try {
      const htmlContent = generatePDFPreview();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      const filename = `${customer.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.html`;
      await savePDFToStorage(customer.id, blob, filename);
      
      toast({
        title: "PDF Saved",
        description: "Customer report has been saved to secure storage.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save PDF report.",
      });
    }
  };

  const printPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(generatePDFPreview());
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Settings Panel */}
      <div className="w-1/3 bg-white border-r p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">PDF Editor</h1>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Include Vegetable Images</Label>
              <Switch
                checked={settings.includeVegetableImages}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, includeVegetableImages: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Price Details</Label>
              <Switch
                checked={settings.showPriceDetails}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, showPriceDetails: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Compact Layout</Label>
              <Switch
                checked={settings.compactLayout}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, compactLayout: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {sections.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 mb-2 bg-gray-50 rounded-lg border ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{section.title}</span>
                              <Switch
                                checked={section.enabled}
                                onCheckedChange={() => toggleSection(section.id)}
                                disabled={!section.customizable}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-3">
          <Button onClick={savePDF} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save PDF
          </Button>
          <Button onClick={printPDF} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Print PDF
          </Button>
          <Button 
            onClick={() => setIsPreviewMode(!isPreviewMode)} 
            variant="outline" 
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 p-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Live Preview - {customer.name}</CardTitle>
          </CardHeader>
          <CardContent className="h-full overflow-auto">
            {isPreviewMode ? (
              <iframe
                srcDoc={generatePDFPreview()}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4" />
                  <p>Click "Show Preview" to see your PDF layout</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerPDFEditorPage;
