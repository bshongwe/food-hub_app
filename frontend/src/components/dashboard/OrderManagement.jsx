import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const statusOptions = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled"
];

export default function OrderManagement({ orders, restaurants }) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Order.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurantOrders'] });
    },
  });

  if (orders.length === 0) {
    return <p className="text-center text-gray-500 py-8">No orders yet.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(order.created_date), "MMM d, yyyy 'at' h:mm a")}
              </p>
              <p className="text-sm text-gray-600 mt-1">{order.user_email}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">R{order.total_amount.toFixed(2)}</p>
              <Badge variant="outline" className="mt-1">
                {order.delivery_type === "delivery" ? "Delivery" : "Pickup"}
              </Badge>
            </div>
          </div>

          <div className="border-t pt-4 mb-4">
            <h4 className="font-semibold mb-2">Items:</h4>
            <div className="space-y-1">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>R{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {order.delivery_address && (
            <div className="border-t pt-4 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Address:</span> {order.delivery_address}
              </p>
            </div>
          )}

          {order.phone && (
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-semibold">Phone:</span> {order.phone}
            </p>
          )}

          {order.special_instructions && (
            <div className="border-t pt-4 mb-4">
              <p className="text-sm">
                <span className="font-semibold">Special Instructions:</span><br />
                {order.special_instructions}
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <Label className="text-sm font-semibold mb-2 block">Update Status:</Label>
            <Select
              value={order.status}
              onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      ))}
    </div>
  );
}
