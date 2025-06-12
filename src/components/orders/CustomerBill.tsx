
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/types/order";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface CustomerBillProps {
  order: Order;
  customer: Customer;
  vegetables: Vegetable[];
  onClose: () => void;
  onPaymentUpdate: (orderId: string, paidAmount: number, paymentMethod: string) => void;
}

const CustomerBill: React.FC<CustomerBillProps> = ({
  order,
  customer,
  vegetables,
  onClose,
  onPaymentUpdate,
}) => {
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const { toast } = useToast();

  const generateUPIQRCode = (amount: number) => {
    const upiId = "chowdaryindianbank@ybl";
    const upiString = `upi://pay?pa=${upiId}&pn=GO%20GREEN%20LEAFY%20VEGETABLES&am=${amount}&cu=INR&tn=Order%20${order.id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  };

  const handlePayment = () => {
    if (paymentAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
      });
      return;
    }

    if (paymentAmount > order.balance_amount) {
      toast({
        variant: "destructive",
        title: "Excess Payment",
        description: "Payment amount cannot exceed the balance amount",
      });
      return;
    }

    onPaymentUpdate(order.id, paymentAmount, paymentMethod);
    setPaymentAmount(0);
    
    toast({
      title: "Payment Recorded",
      description: `₹${paymentAmount} payment recorded via ${paymentMethod}`,
    });
  };

  const generateBillPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const balanceAfterPayment = order.balance_amount - paymentAmount;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Bill - ${customer.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { color: #22c55e; font-size: 24px; font-weight: bold; }
            .bill-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .customer-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .payment-section { background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .qr-section { text-align: center; margin: 20px 0; }
            .total-section { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .balance-due { color: #dc2626; font-weight: bold; }
            .balance-advance { color: #059669; font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">GO GREEN LEAFY VEGETABLES</div>
            <div>Customer Bill</div>
          </div>
          
          <div class="bill-info">
            <h3>Bill Information</h3>
            <div class="customer-info">
              <div>
                <p><strong>Bill No:</strong> ${order.id.substring(0, 8)}</p>
                <p><strong>Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${customer.name}</p>
                <p><strong>Mobile:</strong> ${customer.mobile}</p>
              </div>
              <div>
                ${customer.shop_name ? `<p><strong>Shop:</strong> ${customer.shop_name}</p>` : ''}
                ${customer.location ? `<p><strong>Location:</strong> ${customer.location}</p>` : ''}
                <p><strong>Customer Code:</strong> ${customer.qr_code}</p>
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items?.map(item => {
                const vegetable = vegetables.find(v => v.id === item.vegetable_id);
                return vegetable ? `
                  <tr>
                    <td>${vegetable.name}</td>
                    <td>${item.quantity}</td>
                    <td>${vegetable.unit}</td>
                    <td>₹${item.unit_price.toFixed(2)}</td>
                    <td>₹${item.total_price.toFixed(2)}</td>
                  </tr>
                ` : '';
              }).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <h3>Payment Summary</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div><strong>Total Amount:</strong></div>
              <div>₹${order.total_amount.toFixed(2)}</div>
              <div><strong>Previous Paid:</strong></div>
              <div>₹${order.paid_amount.toFixed(2)}</div>
              ${paymentAmount > 0 ? `
                <div><strong>Current Payment (${paymentMethod.toUpperCase()}):</strong></div>
                <div>₹${paymentAmount.toFixed(2)}</div>
              ` : ''}
              <div style="border-top: 1px solid #ddd; padding-top: 10px;"><strong>Balance Amount:</strong></div>
              <div style="border-top: 1px solid #ddd; padding-top: 10px;" class="${balanceAfterPayment > 0 ? 'balance-due' : 'balance-advance'}">
                ${balanceAfterPayment === 0 ? 'PAID' : balanceAfterPayment > 0 ? `₹${balanceAfterPayment.toFixed(2)} DUE` : `₹${Math.abs(balanceAfterPayment).toFixed(2)} ADVANCE`}
              </div>
            </div>
          </div>
          
          ${balanceAfterPayment > 0 ? `
            <div class="payment-section">
              <h3>Pay via UPI</h3>
              <p>Scan the QR code below to pay ₹${balanceAfterPayment.toFixed(2)} instantly</p>
              <div class="qr-section">
                <img src="${generateUPIQRCode(balanceAfterPayment)}" alt="UPI Payment QR Code" style="width: 200px; height: 200px;">
                <p><strong>UPI ID:</strong> chowdaryindianbank@ybl</p>
                <p><strong>Amount:</strong> ₹${balanceAfterPayment.toFixed(2)}</p>
              </div>
            </div>
          ` : ''}
          
          <div style="margin-top: 40px; font-size: 12px; color: #666; text-align: center;">
            Thank you for your business!<br>
            Generated by GO GREEN LEAFY VEGETABLES Management System
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Bill - {customer.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Order ID: {order.id.substring(0, 8)}</div>
                <div>Date: {new Date(order.order_date).toLocaleDateString()}</div>
                <div>Total Amount: ₹{order.total_amount.toFixed(2)}</div>
                <div>Paid Amount: ₹{order.paid_amount.toFixed(2)}</div>
                <div>Balance: ₹{order.balance_amount.toFixed(2)}</div>
                <div>Status: {order.payment_status}</div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          {order.balance_amount > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Record Payment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment-amount">Payment Amount</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Enter amount"
                      max={order.balance_amount}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(value: 'cash' | 'upi') => setPaymentMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">PhonePe UPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handlePayment} className="mt-4">
                  Record Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* UPI QR Code */}
          {order.balance_amount > 0 && (
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold mb-4">Pay via UPI</h3>
                <div className="flex justify-center mb-4">
                  <img 
                    src={generateUPIQRCode(order.balance_amount)} 
                    alt="UPI Payment QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>UPI ID:</strong> chowdaryindianbank@ybl<br/>
                  <strong>Amount:</strong> ₹{order.balance_amount.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={generateBillPDF}>
              Generate PDF Bill
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerBill;
