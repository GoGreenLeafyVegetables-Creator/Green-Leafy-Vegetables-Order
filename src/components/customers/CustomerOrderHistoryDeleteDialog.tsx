
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Customer } from "@/types/customer";

interface CustomerOrderHistoryDeleteDialogProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerId: string) => Promise<void>;
}

const CustomerOrderHistoryDeleteDialog: React.FC<CustomerOrderHistoryDeleteDialogProps> = ({
  customer,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await onConfirm(customer.id);
    } catch (error) {
      console.error('Error in delete confirmation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Reset Customer Data
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete all order and payment history for this customer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm">
              <strong>Customer:</strong> {customer.name} ({customer.customer_code})
              <br />
              <strong>Mobile:</strong> {customer.mobile}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700 font-medium">
              ⚠️ WARNING: This action cannot be undone!
            </p>
            <ul className="text-xs text-amber-700 mt-2 space-y-1">
              <li>• All order history will be deleted</li>
              <li>• All payment records will be removed</li>
              <li>• Old balance will be reset to ₹0</li>
              <li>• Customer will start with a clean slate</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Resetting..." : "Reset Customer Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerOrderHistoryDeleteDialog;
