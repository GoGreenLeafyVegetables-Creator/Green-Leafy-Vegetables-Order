
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Customer } from "@/types/customer";
import { useToast } from "@/components/ui/use-toast";

interface CustomerOrderHistoryDeleteDialogProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerId: string) => void;
}

const CustomerOrderHistoryDeleteDialog: React.FC<CustomerOrderHistoryDeleteDialogProps> = ({
  customer,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const { toast } = useToast();
  
  const requiredText = `DELETE ${customer.name}`;
  const isConfirmValid = confirmText === requiredText;

  const handleConfirm = () => {
    if (!isConfirmValid) {
      toast({
        variant: "destructive",
        title: "Invalid Confirmation",
        description: "Please type the exact confirmation text to proceed",
      });
      return;
    }
    
    onConfirm(customer.id);
    setConfirmText("");
    onClose();
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete All Customer Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold text-red-800">⚠️ DANGER ZONE</h4>
                <p className="text-sm text-red-700">
                  This action will permanently delete <strong>ALL</strong> data for customer:
                </p>
                <div className="bg-white p-2 rounded border text-sm">
                  <strong>{customer.name}</strong> ({customer.mobile})
                  {customer.shop_name && <div>Shop: {customer.shop_name}</div>}
                  {customer.location && <div>Location: {customer.location}</div>}
                </div>
                <ul className="text-sm text-red-700 space-y-1 ml-4">
                  <li>• All order history</li>
                  <li>• All payment records</li>
                  <li>• All balance details</li>
                  <li>• Customer profile information</li>
                </ul>
                <p className="text-sm font-semibold text-red-800">
                  This action cannot be undone!
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Type <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{requiredText}</code> to confirm deletion:
            </Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${requiredText}" to confirm`}
              className={`${
                confirmText && !isConfirmValid 
                  ? "border-red-300 focus:border-red-500" 
                  : isConfirmValid 
                    ? "border-green-300 focus:border-green-500"
                    : ""
              }`}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              <strong>Admin Access Required:</strong> Only administrators can perform this operation. 
              Make sure you have proper authorization before proceeding.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!isConfirmValid}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerOrderHistoryDeleteDialog;
