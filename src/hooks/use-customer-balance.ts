
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
        .select();
      
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
      
      try {
        // Call the database function directly
        const { error } = await supabase.rpc('reset_customer_billing_data', {
          customer_uuid: customerId
        });
        
        if (error) {
          console.error('Error calling reset function:', error);
          throw error;
        }
        
        console.log('Customer data reset completed successfully');
        return { success: true };
      } catch (error) {
        console.error('Error in reset process:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (error) => {
      console.error('Reset customer data mutation failed:', error);
    }
  });
};

export const useCreateOldBalancePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      customerId, 
      amount, 
      paymentDate, 
      paymentMethod, 
      notes 
    }: { 
      customerId: string;
      amount: number;
      paymentDate: string;
      paymentMethod: string;
      notes?: string;
    }) => {
      console.log('Creating old balance payment:', { customerId, amount, paymentDate, paymentMethod });
      
      // Use the admin bypass by calling a function or use a workaround
      // Since RLS is blocking INSERT, let's try with the service role or bypass
      const { data, error } = await supabase
        .from('payments')
        .insert({
          customer_id: customerId,
          amount: amount,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          notes: notes || `Old balance payment - ${paymentMethod}`,
          order_id: null // Explicitly set to null for old balance payments
        })
        .select();
      
      if (error) {
        console.error('Error creating old balance payment:', error);
        throw error;
      }
      
      console.log('Old balance payment created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['customer-analytics'] });
    },
    onError: (error) => {
      console.error('Old balance payment creation failed:', error);
    }
  });
};

export const useUpdateCustomerPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, updates }: { 
      orderId: string, 
      updates: { paid_amount: number; payment_status: string; payment_method: string } 
    }) => {
      console.log('Updating payment for order:', orderId, updates);
      
      const { data, error } = await supabase
        .from('orders')
        .update({
          paid_amount: updates.paid_amount,
          payment_status: updates.payment_status,
          payment_method: updates.payment_method,
          balance_amount: 0 // Will be calculated by trigger
        })
        .eq('id', orderId)
        .select();
      
      if (error) {
        console.error('Error updating payment:', error);
        throw error;
      }
      
      console.log('Payment updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-analytics'] });
    },
    onError: (error) => {
      console.error('Payment update mutation failed:', error);
    }
  });
};
