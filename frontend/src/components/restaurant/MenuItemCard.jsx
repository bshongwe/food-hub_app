import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Leaf, Flame, Star as StarIcon, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export default function MenuItemCard({ item, restaurant }) {
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const isPremiumUser = user?.subscription_status === 'premium';
  const canAddToCart = item.is_available && (!item.is_exclusive || isPremiumUser);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartRestaurant = JSON.parse(localStorage.getItem('cartRestaurant') || 'null');

    if (cartRestaurant && cartRestaurant.id !== restaurant.id) {
      if (!confirm(`Your cart contains items from ${cartRestaurant.name}. Do you want to clear it and add items from ${restaurant.name}?`)) {
        return;
      }
      localStorage.removeItem('cart');
    }

    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('cartRestaurant', JSON.stringify(restaurant));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleUpgrade = () => {
      navigate(createPageUrl('Subscription'));
  }

  return (
    <div className={`flex gap-4 p-4 border rounded-lg hover:shadow-md transition-all duration-200 ${item.is_exclusive ? 'border-yellow-300 bg-yellow-50/50' : ''}`}>
      <img
        src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-lg"
      />
      
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {item.is_exclusive && <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-400" />}
              <h4 className="font-semibold text-lg">{item.name}</h4>
              {item.is_vegetarian && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Leaf className="w-3 h-3 mr-1" />
                  Veg
                </Badge>
              )}
              {item.is_spicy && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <Flame className="w-3 h-3 mr-1" />
                  Spicy
                </Badge>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
            <p className="text-orange-600 font-bold text-lg">R{item.price.toFixed(2)}</p>
          </div>
          
          {item.is_exclusive && !isPremiumUser ? (
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={handleUpgrade} size="icon" className="bg-yellow-500 hover:bg-yellow-600 flex-shrink-0">
                            <Lock className="w-5 h-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Subscribe to unlock</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
          ) : (
            <Button
                onClick={addToCart}
                disabled={!canAddToCart}
                size="icon"
                className="bg-orange-500 hover:bg-orange-600 flex-shrink-0"
            >
                <Plus className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        {!item.is_available && (
          <Badge variant="secondary" className="mt-2">
            Currently Unavailable
          </Badge>
        )}
      </div>
    </div>
  );
}