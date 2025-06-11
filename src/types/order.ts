
export interface OrderItem {
  vegetableId: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  date: string; // ISO string
  items: OrderItem[];
  timestamp: string; // ISO string
  total: number;
}
