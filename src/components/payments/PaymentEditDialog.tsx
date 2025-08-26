
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Order } from "@/types/order";
import { Customer } from "@/types/customer";

interface PaymentEditDialogProps {
  order: Order | null;
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderId: string, updates: { paid_amount: number; payment_status: string; payment_method: string }) => void;
}

const PaymentEditDialog: React.FC<PaymentEditDialogProps> = ({
  order,
  customer,
  isOpen,
  onClose,
  onSave,
}) => {
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'mixed'>('cash');
  const { toast } = useToast();

  React.useEffect(() => {
    if (order) {
      setPaidAmount(order.paid_amount);
      setPaymentMethod(order.payment_method as 'cash' | 'upi' | 'mixed');
    }
  }, [order]);

  const calculatePaymentStatus = (total: number, paid: number): 'pending' | 'partial' | 'paid' => {
    if (paid === 0) return 'pending';
    if (paid >= total) return 'paid';
    return 'partial';
  };

  const handleSave = () => {
    if (!order) return;

    if (paidAmount < 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Paid amount cannot be negative",
      });
      return;
    }

    if (paidAmount > order.total_amount) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Paid amount cannot exceed total amount",
      });
      return;
    }

    const paymentStatus = calculatePaymentStatus(order.total_amount, paidAmount);

    onSave(order.id, {
      paid_amount: paidAmount,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
    });

    onClose();
  };

  if (!order || !customer) return null;

  const balanceAmount = order.total_amount - paidAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Payment - {customer.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Order Total</Label>
              <p className="font-medium">₹{order.total_amount.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Current Balance</Label>
              <p className={`font-medium ${balanceAmount > 0 ? 'text-red-600' : balanceAmount < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {balanceAmount > 0 && `₹${balanceAmount.toFixed(2)} Due`}
                {balanceAmount < 0 && `₹${Math.abs(balanceAmount).toFixed(2)} Advance`}
                {balanceAmount === 0 && "Fully Paid"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paid-amount">Paid Amount</Label>
            <Input
              id="paid-amount"
              type="number"
              min="0"
              max={order.total_amount}
              step="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(value: 'cash' | 'upi' | 'mixed') => setPaymentMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">PhonePe UPI</SelectItem>
                <SelectItem value="mixed">Mixed (Cash + UPI)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-blue-50 rounded-md">
            <Label className="text-sm text-muted-foreground">New Balance</Label>
            <p className={`font-medium ${balanceAmount > 0 ? 'text-red-600' : balanceAmount < 0 ? 'text-green-600' : 'text-gray-600'}`}>
              {(order.total_amount - paidAmount) > 0 && `₹${(order.total_amount - paidAmount).toFixed(2)} Due`}
              {(order.total_amount - paidAmount) < 0 && `₹${Math.abs(order.total_amount - paidAmount).toFixed(2)} Advance`}
              {(order.total_amount - paidAmount) === 0 && "Fully Paid"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Update Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentEditDialog;
