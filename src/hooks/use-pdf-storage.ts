
import { supabase } from "@/integrations/supabase/client";

export const usePDFStorage = () => {
  const savePDFToStorage = async (customerId: string, pdfBlob: Blob, filename: string) => {
    try {
      const filePath = `${customerId}/${filename}`;
      
      const { data, error } = await supabase.storage
        .from('customer-reports')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving PDF to storage:', error);
      throw error;
    }
  };

  const getPDFUrl = async (customerId: string, filename: string) => {
    try {
      const filePath = `${customerId}/${filename}`;
      
      const { data } = await supabase.storage
        .from('customer-reports')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting PDF URL:', error);
      return null;
    }
  };

  const listCustomerReports = async (customerId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('customer-reports')
        .list(customerId, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing customer reports:', error);
      return [];
    }
  };

  return {
    savePDFToStorage,
    getPDFUrl,
    listCustomerReports
  };
};
