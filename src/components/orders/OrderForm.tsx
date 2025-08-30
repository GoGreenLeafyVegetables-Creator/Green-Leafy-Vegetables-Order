
import React from "react";
import OrderFormUpdate from "./OrderFormUpdate";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";
import { Order } from "@/types/order";

interface OrderFormProps {
  onSave: (order: Order) => void;
  onCancel: () => void;
  customers: Customer[];
  vegetables: Vegetable[];
  initialData?: Order;
  preSelectedCustomerId?: string | null;
}

const OrderForm: React.FC<OrderFormProps> = (props) => {
  return <OrderFormUpdate {...props} />;
};

export default OrderForm;
