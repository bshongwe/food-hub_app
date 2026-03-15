import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(createPageUrl("RestaurantDetail") + `?id=${restaurant.id}`)}
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative h-48">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-3 right-3 bg-white text-gray-900 border border-gray-200">
          {restaurant.cuisine_type}
        </Badge>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{restaurant.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{restaurant.description}</p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
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
          {restaurant.delivery_fee !== undefined && (
            <div className="flex items-center gap-1 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>{restaurant.delivery_fee === 0 ? 'Free' : `R${restaurant.delivery_fee.toFixed(2)}`}</span>
            </div>
          )}
        </div>

        {restaurant.minimum_order > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            Min. order R{restaurant.minimum_order}
          </p>
        )}
      </div>
    </Card>
  );
}
