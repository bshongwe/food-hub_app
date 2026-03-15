import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, DollarSign, Clock } from "lucide-react";
import RestaurantManagement from "../components/dashboard/RestaurantManagement";
import MenuManagement from "../components/dashboard/MenuManagement";
import OrderManagement from "../components/dashboard/OrderManagement";

export default function RestaurantDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: restaurants } = useQuery({
    queryKey: ['myRestaurants', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Restaurant.filter({ owner_email: user.email });
    },
    enabled: !!user,
    initialData: [],
  });

  const { data: orders } = useQuery({
    queryKey: ['restaurantOrders', restaurants],
    queryFn: async () => {
      if (restaurants.length === 0) return [];
      const restaurantIds = restaurants.map(r => r.id);
      const allOrders = await base44.entities.Order.list("-created_date", 100);
      return allOrders.filter(order => restaurantIds.includes(order.restaurant_id));
    },
    enabled: restaurants.length > 0,
    initialData: [],
  });

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === "pending").length,
    revenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Restaurant Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold mt-1">{stats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold mt-1">R{stats.revenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card className="p-6">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              <OrderManagement orders={orders} restaurants={restaurants} />
            </TabsContent>

            <TabsContent value="menu" className="mt-6">
              <MenuManagement restaurants={restaurants} />
            </TabsContent>

            <TabsContent value="restaurant" className="mt-6">
              <RestaurantManagement restaurants={restaurants} userEmail={user.email} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
