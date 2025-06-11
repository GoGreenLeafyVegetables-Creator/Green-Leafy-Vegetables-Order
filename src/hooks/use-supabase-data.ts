
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer, Vegetable, Order, OrderItem, Payment } from "@/types";

// Customers
export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Customer[];
    }
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: Omit<Customer, 'id' | 'qr_code' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();
      
      if (error) throw error;
      return data as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};

// Vegetables
export const useVegetables = () => {
  return useQuery({
    queryKey: ['vegetables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vegetables')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Vegetable[];
    }
  });
};

export const useCreateVegetable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vegetable: Omit<Vegetable, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('vegetables')
        .insert([vegetable])
        .select()
        .single();
      
      if (error) throw error;
      return data as Vegetable;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vegetables'] });
    }
  });
};

// Orders
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            vegetables (name, unit)
          ),
          customers (name, mobile)
        `)
        .order('order_date', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    }
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ order, items }: { order: Omit<Order, 'id' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'order_id'>[] }) => {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      const orderItems = items.map(item => ({
        ...item,
        order_id: orderData.id
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      return orderData as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-analytics'] });
    }
  });
};

// Customer Analytics
export const useCustomerAnalytics = (customerId?: string) => {
  return useQuery({
    queryKey: ['customer-analytics', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId!)
        .order('order_date', { ascending: false });
      
      if (error) throw error;
      
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      
      const yearlyTotal = data
        .filter(order => new Date(order.order_date).getFullYear() === currentYear)
        .reduce((sum, order) => sum + order.total_amount, 0);
      
      const monthlyTotal = data
        .filter(order => {
          const orderDate = new Date(order.order_date);
          return orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth;
        })
        .reduce((sum, order) => sum + order.total_amount, 0);
      
      const totalBalance = data.reduce((sum, order) => sum + order.balance_amount, 0);
      
      return {
        orders: data,
        yearlyTotal,
        monthlyTotal,
        totalBalance,
        totalOrders: data.length
      };
    },
    enabled: !!customerId
  });
};
