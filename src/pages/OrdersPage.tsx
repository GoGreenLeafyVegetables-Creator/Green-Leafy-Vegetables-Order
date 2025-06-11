
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import OrderList from "@/components/orders/OrderList";
import OrderDetails from "@/components/orders/OrderDetails";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Order } from "@/types/order";
import { Customer } from "@/types/customer";
import { Vegetable } from "@/types/vegetable";
import { useToast } from "@/components/ui/use-toast";

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useLocalStorage<Order[]>("orders", []);
  const [customers] = useLocalStorage<Customer[]>("customers", []);
  const [vegetables] = useLocalStorage<Vegetable[]>("vegetables", []);
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  
  const { toast } = useToast();

  const handleNewOrder = () => {
    navigate("/orders/new");
  };

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
    setIsDetailsOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    navigate(`/orders/edit/${order.id}`);
  };

  const handleDeleteOrder = (orderId: string) => {
    setDeletingOrderId(orderId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteOrder = () => {
    if (deletingOrderId) {
      setOrders(orders.filter(order => order.id !== deletingOrderId));
      
      toast({
        title: "Order Deleted",
        description: "The order has been deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
      setDeletingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <Button onClick={handleNewOrder}>New Order</Button>
      </div>
      
      <OrderList 
        orders={orders}
        customers={customers}
        onView={handleViewOrder}
        onEdit={handleEditOrder}
        onDelete={handleDeleteOrder}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCustomerId={selectedCustomerId}
        setSelectedCustomerId={setSelectedCustomerId}
      />
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          {viewingOrder && (
            <OrderDetails
              order={viewingOrder}
              customer={customers.find(c => c.id === viewingOrder.customerId)}
              vegetables={vegetables}
              onEdit={() => {
                setIsDetailsOpen(false);
                handleEditOrder(viewingOrder);
              }}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteOrder}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersPage;
