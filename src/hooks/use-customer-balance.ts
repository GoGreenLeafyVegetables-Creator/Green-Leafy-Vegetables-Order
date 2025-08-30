
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
        // First get all order IDs for this customer
        const { data: orderIds, error: orderIdsError } = await supabase
          .from('orders')
          .select('id')
          .eq('customer_id', customerId);
        
        if (orderIdsError) {
          console.error('Error fetching order IDs:', orderIdsError);
          throw orderIdsError;
        }
        
        console.log('Found orders to delete:', orderIds?.length || 0);
        
        // Delete order items if there are orders
        if (orderIds && orderIds.length > 0) {
          const orderIdList = orderIds.map(order => order.id);
          
          console.log('Deleting order items for orders:', orderIdList);
          const { error: orderItemsError } = await supabase
            .from('order_items')
            .delete()
            .in('order_id', orderIdList);
          
          if (orderItemsError) {
            console.error('Error deleting order items:', orderItemsError);
            throw orderItemsError;
          }
          console.log('Order items deleted successfully');
        }
        
        // Then delete orders
        console.log('Deleting orders for customer:', customerId);
        const { error: ordersError } = await supabase
          .from('orders')
          .delete()
          .eq('customer_id', customerId);
        
        if (ordersError) {
          console.error('Error deleting orders:', ordersError);
          throw ordersError;
        }
        console.log('Orders deleted successfully');
        
        // Delete payments
        console.log('Deleting payments for customer:', customerId);
        const { error: paymentsError } = await supabase
          .from('payments')
          .delete()
          .eq('customer_id', customerId);
        
        if (paymentsError) {
          console.error('Error deleting payments:', paymentsError);
          throw paymentsError;
        }
        console.log('Payments deleted successfully');
        
        // Reset old_balance to 0
        console.log('Resetting old balance to 0 for customer:', customerId);
        const { error: customerError } = await supabase
          .from('customers')
          .update({ old_balance: 0 })
          .eq('id', customerId);
        
        if (customerError) {
          console.error('Error resetting old balance:', customerError);
          throw customerError;
        }
        console.log('Old balance reset successfully');
        
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
      
      const { data, error } = await supabase
        .from('payments')
        .insert({
          customer_id: customerId,
          amount: amount,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          notes: notes || `Old balance payment - ${paymentMethod}`
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
