
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomers, useCustomerAnalytics } from "@/hooks/use-supabase-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CustomerPDFEditor from "@/components/customers/CustomerPDFEditor";

const CustomerPDFEditorPage = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { data: customers } = useCustomers();
  const customer = customers?.find(c => c.id === customerId);
  const { data: analytics } = useCustomerAnalytics(customerId);

  if (!customer) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Customer Not Found</h1>
          <Button onClick={() => navigate('/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading customer data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/customers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h1 className="text-3xl font-bold">PDF Editor</h1>
            <p className="text-muted-foreground">
              Edit and customize the PDF report for {customer.name}
            </p>
          </div>
        </div>
        
        <CustomerPDFEditor
          customer={customer}
          analytics={analytics}
          onClose={() => navigate('/customers')}
          isFullPage={true}
        />
      </div>
    </div>
  );
};

export default CustomerPDFEditorPage;
