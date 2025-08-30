
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, FileText, IndianRupee, Calendar, Phone, MapPin, Store, Trash2, Edit, ExternalLink, Settings } from "lucide-react";
import { Customer } from "@/types/customer";
import { useCustomerAnalytics } from "@/hooks/use-supabase-data";
import { useResetCustomerBillingData } from "@/hooks/use-customer-balance";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import CustomerQRCode from "./CustomerQRCode";
import CustomerPDFReport from "./CustomerPDFReport";
import CustomerOrderHistoryDeleteDialog from "./CustomerOrderHistoryDeleteDialog";
import CustomerBalanceManagementDialog from "./CustomerBalanceManagementDialog";

interface CustomerManagementProps {
  customer: Customer;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customer }) => {
  const [showQR, setShowQR] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const resetCustomerData = useResetCustomerBillingData();
  
  // Add safety check for customer
  if (!customer) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No customer selected. Please select a customer to manage.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data: analytics, isLoading } = useCustomerAnalytics(customer.id);

  const getStatusBadge = (balance: number, oldBalance: number = 0) => {
    const totalBalance = balance + oldBalance;
    if (totalBalance === 0) return <Badge className="bg-green-500">No Dues</Badge>;
    if (totalBalance > 0) return <Badge variant="destructive">₹{totalBalance.toFixed(2)} Due</Badge>;
    return <Badge className="bg-blue-500">₹{Math.abs(totalBalance).toFixed(2)} Advance</Badge>;
  };

  const handleResetCustomerData = async (customerId: string) => {
    try {
      console.log('Starting customer data reset for:', customerId);
      await resetCustomerData.mutateAsync(customerId);
      toast({
        title: "Customer Data Reset",
        description: "All previous records cleared. Customer now has fresh billing start with ₹0 balance.",
      });
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error resetting customer data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset customer data. Please try again.",
      });
    }
  };

  const handleEditPDF = () => {
    navigate(`/customers/${customer.id}/pdf-editor`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{customer.name}</CardTitle>
            <div className="text-sm text-muted-foreground mb-2">
              Customer ID: <span className="font-mono">{customer.customer_code}</span>
            </div>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {customer.mobile}
              </div>
              {customer.shop_name && (
                <div className="flex items-center gap-1">
                  <Store className="h-3 w-3" />
                  {customer.shop_name}
                </div>
              )}
              {customer.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {customer.location}
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-green-600 font-medium">
              Shree Ganesha Green Leafy Vegetables
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBalanceDialog(true)}
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage Balance
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowQR(true)}
            >
              <QrCode className="h-4 w-4 mr-1" />
              QR Code
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPDF(true)}
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF Report
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditPDF}
            >
              <Edit className="h-4 w-4 mr-1" />
              <ExternalLink className="h-3 w-3" />
              Edit PDF
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={resetCustomerData.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {resetCustomerData.isPending ? "Resetting..." : "Reset Data"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div>Loading analytics...</div>
        ) : analytics ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 mx-auto mb-1 text-blue-600" />
              <div className="text-lg font-semibold text-blue-800">₹{analytics.monthlyTotal.toFixed(2)}</div>
              <div className="text-xs text-blue-600">This Month</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Calendar className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <div className="text-lg font-semibold text-green-800">₹{analytics.yearlyTotal.toFixed(2)}</div>
              <div className="text-xs text-green-600">This Year</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <IndianRupee className="h-5 w-5 mx-auto mb-1 text-purple-600" />
              <div className="text-lg font-semibold text-purple-800">{analytics.totalOrders}</div>
              <div className="text-xs text-purple-600">Total Orders</div>
            </div>

            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <IndianRupee className="h-5 w-5 mx-auto mb-1 text-amber-600" />
              <div className="text-lg font-semibold text-amber-800">₹{(customer.old_balance || 0).toFixed(2)}</div>
              <div className="text-xs text-amber-600">Old Balance</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="flex justify-center mb-1">
                {getStatusBadge(analytics.totalBalance, customer.old_balance || 0)}
              </div>
              <div className="text-xs text-orange-600">Total Balance</div>
            </div>
          </div>
        ) : null}
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium">Customer Page URL:</div>
          <div className="text-xs text-blue-600 break-all">
            {window.location.origin}/customer/{customer.qr_code}
          </div>
        </div>
      </CardContent>
      
      {showQR && (
        <CustomerQRCode
          customer={customer}
          onClose={() => setShowQR(false)}
        />
      )}
      
      {showPDF && analytics && (
        <CustomerPDFReport
          customer={customer}
          analytics={analytics}
          onClose={() => setShowPDF(false)}
        />
      )}

      {showDeleteDialog && (
        <CustomerOrderHistoryDeleteDialog
          customer={customer}
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleResetCustomerData}
        />
      )}

      {showBalanceDialog && (
        <CustomerBalanceManagementDialog
          customer={customer}
          isOpen={showBalanceDialog}
          onClose={() => setShowBalanceDialog(false)}
        />
      )}
    </Card>
  );
};

export default CustomerManagement;
