
export interface OrderItem {
  id?: string;
  order_id?: string;
  vegetable_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_date: string;
  total_amount: number;
  payment_status: 'pending' | 'partial' | 'paid';
  payment_method: 'cash' | 'upi' | 'mixed' | 'adjustment';
  paid_amount: number;
  balance_amount: number;
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItem[];
}

export interface Payment {
  id: string;
  customer_id: string;
  order_id?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  created_at?: string;
}
