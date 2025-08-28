
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer, useCustomerAnalytics } from '@/hooks/use-supabase-data';
import CustomerPDFEditorPage from '@/components/customers/CustomerPDFEditorPage';

const PDFEditorPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  const { data: customer, isLoading: customerLoading } = useCustomer(customerId || '');
  const { data: analytics, isLoading: analyticsLoading } = useCustomerAnalytics(customerId || '');

  if (customerLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PDF Editor...</p>
        </div>
      </div>
    );
  }

  if (!customer || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Customer not found or analytics unavailable.</p>
          <button
            onClick={() => navigate('/customers')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const handleClose = () => {
    navigate('/customers');
  };

  return (
    <CustomerPDFEditorPage
      customer={customer}
      analytics={analytics}
      onClose={handleClose}
    />
  );
};

export default PDFEditorPage;
