import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Package, CheckCircle, XCircle, Truck, CreditCard, Wallet } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  preparing: { label: "Preparing", color: "bg-purple-100 text-purple-800", icon: Package },
  ready: { label: "Ready", color: "bg-green-100 text-green-800", icon: CheckCircle },
  out_for_delivery: { label: "Out for Delivery", color: "bg-orange-100 text-orange-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
};

const paymentStatusConfig = {
  pending: { label: "Payment Pending", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Paid", color: "bg-green-100 text-green-800" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-800" },
};

export default function Orders() {
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    if (orderId) {
      setHighlightedOrderId(orderId);
      setTimeout(() => setHighlightedOrderId(null), 3000);
    }
  }, []);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Order.filter({ user_email: user.email }, "-created_date");
    },
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-gray-500">Start ordering from your favorite restaurants</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const paymentStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
            const StatusIcon = status.icon;
            const isHighlighted = order.id === highlightedOrderId;

            return (
              <Card
                key={order.id}
                className={`p-6 transition-all duration-300 ${
                  isHighlighted ? 'ring-2 ring-orange-500 shadow-lg' : 'hover:shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{order.restaurant_name}</h3>
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      <Badge className={paymentStatus.color}>
                        {order.payment_status === "paid" ? (
                          <CreditCard className="w-3 h-3 mr-1" />
                        ) : (
                          <Wallet className="w-3 h-3 mr-1" />
                        )}
                        {paymentStatus.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.created_date), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      R{order.total_amount.toFixed(2)}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {order.delivery_type === "delivery" ? (
                        <><Truck className="w-3 h-3 mr-1" /> Delivery</>
                      ) : (
                        <><Package className="w-3 h-3 mr-1" /> Pickup</>
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold">
                        R{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {order.delivery_address && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{order.delivery_address}</span>
                    </div>
                  </div>
                )}

                {order.estimated_time && order.status !== "delivered" && order.status !== "cancelled" && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-600">
                        Estimated {order.delivery_type === "delivery" ? "delivery" : "pickup"} time:{" "}
                        <span className="font-semibold">{order.estimated_time}</span>
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
