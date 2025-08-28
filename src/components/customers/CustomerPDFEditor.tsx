
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "@/types/customer";
import { Move, Eye, FileText, Settings } from "lucide-react";

interface PDFSection {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  content?: string;
}

interface CustomerPDFEditorProps {
  customer: Customer;
  analytics: any;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (sections: PDFSection[], customizations: any) => void;
}

const CustomerPDFEditor: React.FC<CustomerPDFEditorProps> = ({
  customer,
  analytics,
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [sections, setSections] = useState<PDFSection[]>([
    { id: 'header', title: 'Company Header', enabled: true, order: 1 },
    { id: 'customer-info', title: 'Customer Information', enabled: true, order: 2 },
    { id: 'analytics', title: 'Business Analytics', enabled: true, order: 3 },
    { id: 'balance', title: 'Balance Status', enabled: true, order: 4 },
    { id: 'qr-codes', title: 'QR Codes', enabled: true, order: 5 },
    { id: 'orders', title: 'Order History', enabled: true, order: 6 },
  ]);

  const [customizations, setCustomizations] = useState({
    companyName: 'SHREE GANESHA GREEN LEAFY VEGETABLES',
    showUpiId: false,
    pageBreakAfterAnalytics: false,
    ordersPerPage: 3,
    includeItemDetails: true,
    customNote: '',
  });

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
        // Update order numbers
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
        // Update order numbers
        newSections.forEach((section, idx) => {
          section.order = idx + 1;
        });
      }
      return newSections;
    });
  };

  const handleGenerate = () => {
    onGenerate(sections, customizations);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize PDF Report - {customer.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="sections" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sections">Report Sections</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview Layout</TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-4">
            <div className="grid gap-3">
              <h3 className="font-semibold text-sm">Drag to reorder sections:</h3>
              {sections.map((section, index) => (
                <Card key={section.id} className={`${section.enabled ? 'bg-white' : 'bg-gray-50'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={section.enabled}
                          onCheckedChange={() => handleSectionToggle(section.id)}
                        />
                        <span className="font-medium">{section.order}. {section.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveSectionUp(section.id)}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveSectionDown(section.id)}
                          disabled={index === sections.length - 1}
                        >
                          ↓
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
                <CardTitle className="text-sm">Company Settings</CardTitle>
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
                <CardTitle className="text-sm">Layout Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="page-break">Page break after analytics</Label>
                  <Switch
                    id="page-break"
                    checked={customizations.pageBreakAfterAnalytics}
                    onCheckedChange={(checked) => setCustomizations(prev => ({
                      ...prev,
                      pageBreakAfterAnalytics: checked
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="orders-per-page">Orders per page (max)</Label>
                  <Input
                    id="orders-per-page"
                    type="number"
                    min="1"
                    max="10"
                    value={customizations.ordersPerPage}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      ordersPerPage: parseInt(e.target.value) || 3
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
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Report Layout Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white min-h-[400px]">
                  <div className="space-y-4 text-sm">
                    {sections
                      .filter(section => section.enabled)
                      .sort((a, b) => a.order - b.order)
                      .map((section, index) => (
                        <div key={section.id} className="border-b pb-2">
                          <div className="font-medium text-blue-600">
                            Page {Math.ceil((index + 1) / (customizations.pageBreakAfterAnalytics && index >= 3 ? 1 : 3))} - {section.title}
                          </div>
                          <div className="text-gray-600 text-xs mt-1">
                            {section.id === 'header' && `Company: ${customizations.companyName}`}
                            {section.id === 'customer-info' && `${customer.name} - ${customer.mobile}`}
                            {section.id === 'analytics' && `Monthly: ₹${analytics.monthlyTotal?.toFixed(2) || '0.00'} | Yearly: ₹${analytics.yearlyTotal?.toFixed(2) || '0.00'}`}
                            {section.id === 'balance' && `Balance: ₹${analytics.totalBalance?.toFixed(2) || '0.00'}`}
                            {section.id === 'qr-codes' && `UPI QR Code ${customizations.showUpiId ? '+ UPI ID' : '+ Company Name only'}`}
                            {section.id === 'orders' && `Order history (${customizations.ordersPerPage} orders per page, ${customizations.includeItemDetails ? 'with' : 'without'} item details)`}
                          </div>
                        </div>
                      ))}
                    {customizations.customNote && (
                      <div className="border-b pb-2 border-dashed">
                        <div className="font-medium text-green-600">Custom Footer Note</div>
                        <div className="text-gray-600 text-xs mt-1">{customizations.customNote}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Custom PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerPDFEditor;
