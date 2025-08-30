
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
        // First delete order items
        const { error: orderItemsError } = await supabase
          .from('order_items')
          .delete()
          .in('order_id', 
            supabase
              .from('orders')
              .select('id')
              .eq('customer_id', customerId)
          );
        
        if (orderItemsError) {
          console.error('Error deleting order items:', orderItemsError);
          throw orderItemsError;
        }
        
        // Then delete orders
        const { error: ordersError } = await supabase
          .from('orders')
          .delete()
          .eq('customer_id', customerId);
        
        if (ordersError) {
          console.error('Error deleting orders:', ordersError);
          throw ordersError;
        }
        
        // Delete payments
        const { error: paymentsError } = await supabase
          .from('payments')
          .delete()
          .eq('customer_id', customerId);
        
        if (paymentsError) {
          console.error('Error deleting payments:', paymentsError);
          throw paymentsError;
        }
        
        // Reset old_balance to 0
        const { error: customerError } = await supabase
          .from('customers')
          .update({ old_balance: 0 })
          .eq('id', customerId);
        
        if (customerError) {
          console.error('Error resetting old balance:', customerError);
          throw customerError;
        }
        
        console.log('Customer data reset successfully');
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
