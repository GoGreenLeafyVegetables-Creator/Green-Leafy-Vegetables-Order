
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSavePDFReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      customerId, 
      customerQRCode,
      htmlContent, 
      reportType = 'customer_report' 
    }: { 
      customerId: string;
      customerQRCode: string;
      htmlContent: string;
      reportType?: string;
    }) => {
      console.log('Saving PDF report for customer:', customerId);
      
      // Convert HTML to PDF using browser's print functionality
      const printWindow = window.open('', '_blank');
      if (!printWindow) throw new Error('Could not open print window');
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Generate PDF blob (this is a simplified approach - in production you might want to use a proper PDF library)
      const fileName = `${customerQRCode}_report_${Date.now()}.pdf`;
      const folderPath = `${customerQRCode}/${fileName}`;
      
      // For now, we'll save the HTML content as a file since browser PDF generation is complex
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('customer-pdf-reports')
        .upload(folderPath, htmlBlob);

      if (uploadError) {
        console.error('Error uploading PDF:', uploadError);
        throw uploadError;
      }

      // Save report metadata to database
      const { data: reportData, error: reportError } = await supabase
        .from('customer_pdf_reports')
        .insert({
          customer_id: customerId,
          report_type: reportType,
          file_name: fileName,
          file_path: folderPath,
          file_size: htmlBlob.size
        })
        .select()
        .single();

      if (reportError) {
        console.error('Error saving report metadata:', reportError);
        throw reportError;
      }

      console.log('PDF report saved successfully:', reportData);
      return reportData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-pdf-reports'] });
    },
    onError: (error) => {
      console.error('PDF report save failed:', error);
    }
  });
};

export const useCustomerPDFReports = (customerId?: string) => {
  return useQuery({
    queryKey: ['customer-pdf-reports', customerId],
    queryFn: async () => {
      const query = supabase
        .from('customer_pdf_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (customerId) {
        query.eq('customer_id', customerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching PDF reports:', error);
        throw error;
      }

      return data;
    },
    enabled: true
  });
};
