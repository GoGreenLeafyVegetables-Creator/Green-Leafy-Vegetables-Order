
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, FileText, IndianRupee, Calendar, Phone, MapPin, Store, RefreshCw } from "lucide-react";
import { Customer } from "@/types/customer";
import { useCustomerAnalytics, useDeleteCustomer } from "@/hooks/use-supabase-data";
import { useToast } from "@/hooks/use-toast";
import CustomerQRCode from "./CustomerQRCode";
import CustomerPDFReportEnhanced from "./CustomerPDFReportEnhanced";
import CustomerOrderHistoryDeleteDialog from "./CustomerOrderHistoryDeleteDialog";

interface CustomerManagementProps {
  customer: Customer;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customer }) => {
  const [showQR, setShowQR] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const deleteCustomer = useDeleteCustomer();
  
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

  const getStatusBadge = (balance: number) => {
    if (balance === 0) return <Badge className="bg-green-500">No Dues</Badge>;
    if (balance > 0) return <Badge variant="destructive">₹{balance.toFixed(2)} Due</Badge>;
    return <Badge className="bg-blue-500">₹{Math.abs(balance).toFixed(2)} Advance</Badge>;
  };

  const handleDeleteCustomerData = async (customerId: string) => {
    try {
      await deleteCustomer.mutateAsync(customerId);
      toast({
        title: "Customer Billing Reset",
        description: "All customer order and payment history has been cleared. Customer can start fresh with new orders.",
      });
    } catch (error) {
      console.error('Error resetting customer billing:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset customer billing. Please try again.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl">{customer.name}</CardTitle>
            <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
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
          </div>
          <div className="flex flex-wrap gap-2">
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
              className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF Report
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
              onClick={() => setShowDeleteDialog(true)}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset Billing
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div>Loading analytics...</div>
        ) : analytics ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="flex justify-center mb-1">
                {getStatusBadge(analytics.totalBalance)}
              </div>
              <div className="text-xs text-orange-600">Balance Status</div>
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
        <CustomerPDFReportEnhanced
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
          onConfirm={handleDeleteCustomerData}
        />
      )}
    </Card>
  );
};

export default CustomerManagement;
