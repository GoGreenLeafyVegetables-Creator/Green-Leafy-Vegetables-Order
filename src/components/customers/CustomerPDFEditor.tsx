import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Customer } from "@/types/customer";
import { useOrders, useVegetables } from "@/hooks/use-supabase-data";
import { format } from "date-fns";
import { Save, Download, Edit, Move, Type, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ganeshaLogo from "@/assets/ganesha-logo.png";

interface CustomerPDFEditorProps {
  customer: Customer;
  analytics: any;
  onClose: () => void;
  isFullPage?: boolean;
}

interface EditableElement {
  id: string;
  type: 'text' | 'image' | 'qr';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
}

const CustomerPDFEditor: React.FC<CustomerPDFEditorProps> = ({ 
  customer, 
  analytics, 
  onClose, 
  isFullPage = false 
}) => {
  const { data: orders = [] } = useOrders();
  const { data: vegetables = [] } = useVegetables();
  const { toast } = useToast();
  
  const [elements, setElements] = useState<EditableElement[]>([
    {
      id: 'company-name',
      type: 'text',
      content: 'Shree Ganesha Green Leafy Vegetables',
      x: 50,
      y: 50,
      width: 500,
      height: 40,
      fontSize: 24,
      fontWeight: 'bold',
      color: '#22c55e'
    },
    {
      id: 'customer-name',
      type: 'text',
      content: `Customer: ${customer.name}`,
      x: 50,
      y: 120,
      width: 300,
      height: 30,
      fontSize: 18,
      fontWeight: 'bold'
    },
    {
      id: 'customer-mobile',
      type: 'text',
      content: `Mobile: ${customer.mobile}`,
      x: 50,
      y: 160,
      width: 300,
      height: 25,
      fontSize: 14
    },
    {
      id: 'old-balance-info',
      type: 'text',
      content: `Old Balance: ₹${(customer.old_balance || 0).toFixed(2)}`,
      x: 400,
      y: 120,
      width: 200,
      height: 25,
      fontSize: 14,
      color: '#d97706'
    }
  ]);

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);

  const customerOrders = orders
    .filter(order => order.customer_id === customer.id)
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

  const generateUPIQRCode = (amount: number) => {
    const upiString = `upi://pay?pa=chowdaryindianbank@ybl&pn=Shree%20Ganesha%20Green%20Leafy%20Vegetables&am=${amount}&cu=INR&tn=Customer%20${customer.qr_code}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  };

  const generateCustomerPageQR = () => {
    const customerUrl = `${window.location.origin}/customer/${customer.qr_code}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(customerUrl)}`;
  };

  const handleMouseDown = (elementId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedElement(elementId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setElements(prev => prev.map(el => 
      el.id === selectedElement 
        ? { ...el, x: Math.max(0, el.x + deltaX), y: Math.max(0, el.y + deltaY) }
        : el
    ));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateElement = (id: string, updates: Partial<EditableElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const addTextElement = () => {
    const newElement: EditableElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Text Element',
      x: 100,
      y: 200,
      width: 200,
      height: 30,
      fontSize: 14
    };
    setElements(prev => [...prev, newElement]);
  };

  const addImageElement = () => {
    const newElement: EditableElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      content: ganeshaLogo,
      x: 100,
      y: 300,
      width: 150,
      height: 150
    };
    setElements(prev => [...prev, newElement]);
  };

  const savePDFLayout = async () => {
    try {
      const layoutData = {
        customer_id: customer.id,
        layout: elements,
        created_at: new Date().toISOString()
      };

      const fileName = `pdf-layouts/${customer.qr_code}_layout_${Date.now()}.json`;
      
      const { error } = await supabase.storage
        .from('customer-reports')
        .upload(fileName, new Blob([JSON.stringify(layoutData, null, 2)], { type: 'application/json' }));

      if (error) throw error;

      toast({
        title: "Layout Saved",
        description: "PDF layout has been saved successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save PDF layout",
      });
    }
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalBalance = analytics.totalBalance + (customer.old_balance || 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Report - ${customer.name} | Shree Ganesha Green Leafy Vegetables</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              position: relative;
              min-height: 100vh;
            }
            .element {
              position: absolute;
            }
            .page-break {
              page-break-before: always;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${elements.map(el => {
            const style = `
              position: absolute;
              left: ${el.x}px;
              top: ${el.y}px;
              width: ${el.width}px;
              height: ${el.height}px;
              font-size: ${el.fontSize || 14}px;
              font-weight: ${el.fontWeight || 'normal'};
              color: ${el.color || '#000'};
            `;
            
            if (el.type === 'text') {
              return `<div style="${style}">${el.content}</div>`;
            } else if (el.type === 'image') {
              return `<img src="${ganeshaLogo}" style="${style}" alt="Image" />`;
            } else if (el.type === 'qr') {
              return `<img src="${el.content}" style="${style}" alt="QR Code" />`;
            }
            return '';
          }).join('')}

          <div style="position: absolute; top: 400px; left: 50px; width: 700px;">
            <h3 style="color: #22c55e; margin-bottom: 20px;">Order History</h3>
            
            ${customer.old_balance && customer.old_balance > 0 ? `
              <div style="border: 2px solid #d97706; margin-bottom: 20px; border-radius: 8px; background: #fef3c7;">
                <div style="background: #f59e0b; color: white; padding: 10px; font-weight: bold;">
                  Old Balance (Previous Dues)
                </div>
                <div style="padding: 15px; font-size: 18px; font-weight: bold; color: #92400e;">
                  ₹${customer.old_balance.toFixed(2)}
                </div>
              </div>
            ` : ''}
            
            ${customerOrders.map(order => `
              <div style="border: 1px solid #e5e7eb; margin-bottom: 20px; border-radius: 8px;">
                <div style="background: #f9fafb; padding: 15px; border-bottom: 1px solid #e5e7eb;">
                  <strong>Order #SGLV-${order.id.slice(-4)} - ${format(new Date(order.order_date), "dd/MM/yyyy")}</strong>
                  <div style="float: right;">₹${order.total_amount.toFixed(2)}</div>
                </div>
                <div style="padding: 15px;">
                  ${order.order_items ? order.order_items.map((item: any) => {
                    const vegetable = vegetables.find(v => v.id === item.vegetable_id);
                    return `
                      <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        ${vegetable?.photo_url ? `<img src="${vegetable.photo_url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 10px;" alt="${vegetable.name}" />` : ''}
                        <div>
                          <strong>${vegetable?.name || 'Unknown'}</strong><br/>
                          ${item.quantity} ${vegetable?.unit || 'units'} × ₹${item.unit_price.toFixed(2)} = ₹${item.total_price.toFixed(2)}
                        </div>
                      </div>
                    `;
                  }).join('') : ''}
                  <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between;">
                      <span>Paid: ₹${order.paid_amount.toFixed(2)}</span>
                      <span>Balance: ₹${(order.total_amount - order.paid_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
            
            <div style="border: 2px solid #22c55e; margin-top: 30px; border-radius: 8px; background: #f0fdf4;">
              <div style="background: #22c55e; color: white; padding: 15px; font-weight: bold; text-align: center;">
                Total Balance Summary - Shree Ganesha Green Leafy Vegetables
              </div>
              <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Current Orders Balance:</span>
                  <span style="font-weight: bold;">₹${analytics.totalBalance.toFixed(2)}</span>
                </div>
                ${customer.old_balance && customer.old_balance > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #d97706;">
                    <span>Old Balance:</span>
                    <span style="font-weight: bold;">₹${customer.old_balance.toFixed(2)}</span>
                  </div>
                ` : ''}
                <hr style="margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
                  <span>Total Balance:</span>
                  <span style="color: ${totalBalance > 0 ? '#dc2626' : totalBalance < 0 ? '#16a34a' : '#000'};">
                    ₹${totalBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          ${totalBalance > 0 ? `
            <div style="position: absolute; bottom: 100px; left: 50px;">
              <h4>Payment QR Code</h4>
              <img src="${generateUPIQRCode(totalBalance)}" alt="UPI Payment QR" style="width: 150px; height: 150px;" />
              <p><strong>Shree Ganesha Green Leafy Vegetables</strong></p>
              <p>Total Amount: ₹${totalBalance.toFixed(2)}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const editorContent = (
    <div className="flex gap-4 h-[70vh]">
      <div className="w-64 space-y-4 overflow-y-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700 font-medium">
            Shree Ganesha Green Leafy Vegetables
          </p>
          <p className="text-xs text-green-600">PDF Report Editor</p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Add Elements</h4>
          <div className="space-y-2">
            <Button onClick={addTextElement} className="w-full" size="sm">
              <Type className="h-4 w-4 mr-2" />
              Add Text
            </Button>
            <Button onClick={addImageElement} className="w-full" size="sm">
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>
        </div>

        {selectedElement && (
          <div className="space-y-2">
            <h4 className="font-semibold">Edit Selected</h4>
            {elements.find(el => el.id === selectedElement)?.type === 'text' && (
              <>
                <Textarea
                  value={elements.find(el => el.id === selectedElement)?.content || ''}
                  onChange={(e) => updateElement(selectedElement, { content: e.target.value })}
                  placeholder="Text content"
                  rows={3}
                />
                <Input
                  type="number"
                  value={elements.find(el => el.id === selectedElement)?.fontSize || 14}
                  onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                  placeholder="Font size"
                />
                <Input
                  type="color"
                  value={elements.find(el => el.id === selectedElement)?.color || '#000000'}
                  onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                />
              </>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Button onClick={savePDFLayout} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Layout
          </Button>
          <Button onClick={generatePDF} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </div>

      <div 
        ref={editorRef}
        className="flex-1 bg-white border rounded-lg relative overflow-auto"
        style={{ minHeight: '800px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {elements.map(element => (
          <div
            key={element.id}
            className={`absolute cursor-move border-2 ${
              selectedElement === element.id ? 'border-blue-500' : 'border-transparent'
            } hover:border-gray-300`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              fontSize: element.fontSize || 14,
              fontWeight: element.fontWeight || 'normal',
              color: element.color || '#000'
            }}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
          >
            {element.type === 'text' && (
              <div className="w-full h-full flex items-center">
                {element.content}
              </div>
            )}
            {element.type === 'image' && (
              <img 
                src={element.content} 
                alt="Element" 
                className="w-full h-full object-cover"
              />
            )}
            {element.type === 'qr' && (
              <img 
                src={element.content} 
                alt="QR Code" 
                className="w-full h-full object-contain"
              />
            )}
            {selectedElement === element.id && (
              <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded">
                <Move className="h-3 w-3 inline mr-1" />
                Drag to move
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (isFullPage) {
    return (
      <div className="min-h-screen bg-background p-6">
        {editorContent}
      </div>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit PDF Report - {customer.name} | Shree Ganesha Green Leafy Vegetables</DialogTitle>
        </DialogHeader>
        {editorContent}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerPDFEditor;
