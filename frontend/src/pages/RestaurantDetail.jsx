import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, Clock, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MenuItemCard from "../components/restaurant/MenuItemCard";

export default function RestaurantDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get('id');

  const { data: restaurant, isLoading: loadingRestaurant } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      const restaurants = await base44.entities.Restaurant.list();
      return restaurants.find(r => r.id === restaurantId);
    },
    enabled: !!restaurantId,
  });

  const { data: menuItems, isLoading: loadingMenu } = useQuery({
    queryKey: ['menuItems', restaurantId],
    queryFn: () => base44.entities.MenuItem.filter({ restaurant_id: restaurantId }),
    initialData: [],
    enabled: !!restaurantId,
  });

  const categories = [...new Set(menuItems.map(item => item.category || 'Other'))];

  if (loadingRestaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Restaurant not found</h2>
        <Button onClick={() => navigate(createPageUrl("Home"))}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="relative h-64 md:h-96 bg-gray-900">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-80"
        />
        <Button
          onClick={() => navigate(createPageUrl("Home"))}
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 rounded-full shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Restaurant Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {restaurant.name}
              </h1>
              <p className="text-gray-600 mb-4">{restaurant.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {restaurant.cuisine_type}
                </Badge>
                {restaurant.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{restaurant.rating}</span>
                  </div>
                )}
                {restaurant.delivery_time && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{restaurant.delivery_time}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                {restaurant.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 md:min-w-[200px]">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Delivery Fee</p>
                <p className="text-2xl font-bold text-orange-600">
                  R{restaurant.delivery_fee?.toFixed(2) || '0.00'}
                </p>
                {restaurant.minimum_order > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Min. order R{restaurant.minimum_order}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Menu</h2>
          
          {loadingMenu ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No menu items available</p>
          ) : (
            <Tabs defaultValue={categories[0]} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-6">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  {menuItems
                    .filter(item => (item.category || 'Other') === category)
                    .map((item) => (
                      <MenuItemCard key={item.id} item={item} restaurant={restaurant} />
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
