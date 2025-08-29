
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUpdateCustomerOldBalance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, oldBalance }: { customerId: string, oldBalance: number }) => {
      const { data, error } = await supabase
        .from('customers')
        .update({ old_balance: oldBalance })
        .eq('id', customerId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-analytics'] });
    }
  });
};

export const useResetCustomerBillingData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase.rpc('reset_customer_billing_data', {
        customer_uuid: customerId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-analytics'] });
    }
  });
};
