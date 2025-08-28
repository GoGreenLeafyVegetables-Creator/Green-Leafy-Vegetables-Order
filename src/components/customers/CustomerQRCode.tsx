
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";

interface CustomerQRCodeProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerQRCode: React.FC<CustomerQRCodeProps> = ({ customer, onClose }) => {
  const customerUrl = `${window.location.origin}/customer/${customer.qr_code}`;
  
  const downloadQRCode = () => {
    // Generate QR code URL using a free API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(customerUrl)}`;
    
    const link = document.createElement('a');
    link.href = qrApiUrl;
    link.download = `${customer.name}-QR-Code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {customer.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white border rounded-lg">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(customerUrl)}`}
              alt={`QR Code for ${customer.name}`}
              className="w-48 h-48"
            />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Scan this QR code to access customer page
            </p>
            <p className="text-xs text-blue-600 mt-1 break-all">
              {customerUrl}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={downloadQRCode}>
              Download QR Code
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerQRCode;
