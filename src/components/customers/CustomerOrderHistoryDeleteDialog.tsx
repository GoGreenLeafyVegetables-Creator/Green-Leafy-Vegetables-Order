
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, RefreshCw } from "lucide-react";
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
  
  const requiredText = "RESET BILLING";
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
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <RefreshCw className="h-5 w-5" />
            Reset Customer Billing
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-800">Fresh Start for Customer</h4>
                <p className="text-sm text-orange-700">
                  This will reset all billing history for:
                </p>
                <div className="bg-white p-3 rounded border text-sm">
                  <strong>{customer.name}</strong> ({customer.mobile})
                  {customer.shop_name && <div>Shop: {customer.shop_name}</div>}
                  {customer.location && <div>Location: {customer.location}</div>}
                </div>
                <div className="text-sm text-orange-700 space-y-1">
                  <p>• All previous orders will be removed</p>
                  <p>• All payment history will be cleared</p>
                  <p>• Customer balance will be reset to zero</p>
                  <p>• Customer profile will remain unchanged</p>
                </div>
                <p className="text-sm font-semibold text-orange-800">
                  The customer can start fresh with new orders!
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Type <code className="bg-gray-100 px-2 py-1 rounded text-xs">{requiredText}</code> to confirm:
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
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!isConfirmValid}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Billing History
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerOrderHistoryDeleteDialog;
