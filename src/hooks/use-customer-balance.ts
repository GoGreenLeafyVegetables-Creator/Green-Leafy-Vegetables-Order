
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUpdateCustomerOldBalance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, oldBalance }: { customerId: string, oldBalance: number }) => {
      console.log('Updating old balance for customer:', customerId, 'New balance:', oldBalance);
      
      const { data, error } = await supabase
        .from('customers')
        .update({ old_balance: oldBalance })
        .eq('id', customerId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating old balance:', error);
        throw error;
      }
      
      console.log('Old balance updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-analytics'] });
    },
    onError: (error) => {
      console.error('Old balance update mutation failed:', error);
    }
  });
};

export const useResetCustomerBillingData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerId: string) => {
      console.log('Resetting customer billing data for:', customerId);
      
      const { data, error } = await supabase.rpc('reset_customer_billing_data', {
        customer_uuid: customerId
      });
      
      if (error) {
        console.error('Error resetting customer data:', error);
        throw error;
      }
      
      console.log('Customer data reset successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-analytics'] });
    },
    onError: (error) => {
      console.error('Reset customer data mutation failed:', error);
    }
  });
};
