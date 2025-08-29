
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee } from "lucide-react";
import { Customer } from "@/types/customer";
import { useToast } from "@/hooks/use-toast";

interface OldBalanceUpdateDialogProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (customerId: string, newBalance: number) => void;
}

const OldBalanceUpdateDialog: React.FC<OldBalanceUpdateDialogProps> = ({
  customer,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [balance, setBalance] = useState(customer.old_balance?.toString() || "0");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceAmount = parseFloat(balance);
    
    if (isNaN(balanceAmount)) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid number for the balance",
      });
      return;
    }

    onUpdate(customer.id, balanceAmount);
    onClose();
  };

  const handleClose = () => {
    setBalance(customer.old_balance?.toString() || "0");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Update Old Balance
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm">
                <strong>Customer:</strong> {customer.name} ({customer.customer_code})
                <br />
                <strong>Mobile:</strong> {customer.mobile}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Old Balance Amount (₹)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="Enter old balance amount"
                className="text-right"
              />
              <div className="text-xs text-muted-foreground">
                Current old balance: ₹{customer.old_balance?.toFixed(2) || "0.00"}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700">
                This old balance will be added to the customer's current dues and will appear in their billing reports.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Balance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OldBalanceUpdateDialog;
