import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

export default function SeedMenuData() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [complete, setComplete] = useState(false);

  const seedData = async () => {
    setLoading(true);
    setStatus("Fetching restaurants...");

    try {
      const restaurants = await base44.entities.Restaurant.list();
      const menuItems = [];

      // For each restaurant, add sample menu items
      for (const restaurant of restaurants) {
        if (restaurant.name.includes("Bella Italia") || restaurant.name.includes("Italian")) {
          menuItems.push(
            { restaurant_id: restaurant.id, name: "Margherita Pizza", description: "Classic tomato, mozzarella, basil", price: 14.99, category: "Pizza", is_available: true, is_vegetarian: true, image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400" },
            { restaurant_id: restaurant.id, name: "Spaghetti Carbonara", description: "Eggs, pecorino, guanciale", price: 16.99, category: "Pasta", is_available: true, is_vegetarian: false, image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400" },
            { restaurant_id: restaurant.id, name: "Bruschetta", description: "Toasted bread with tomatoes", price: 8.99, category: "Appetizers", is_available: true, is_vegetarian: true, image_url: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400" },
            { restaurant_id: restaurant.id, name: "Lobster Ravioli", description: "Premium lobster pasta", price: 32.99, category: "Pasta", is_available: true, is_exclusive: true, image_url: "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=400" },
            { restaurant_id: restaurant.id, name: "Tiramisu", description: "Classic Italian dessert", price: 8.99, category: "Desserts", is_available: true, is_vegetarian: true, image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400" }
          );
        }
        
        if (restaurant.name.includes("Sakura") || restaurant.name.includes("Sushi") || restaurant.name.includes("Tokyo")) {
          menuItems.push(
            { restaurant_id: restaurant.id, name: "California Roll", description: "Crab, avocado, cucumber", price: 12.99, category: "Sushi", is_available: true, image_url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400" },
            { restaurant_id: restaurant.id, name: "Spicy Tuna Roll", description: "Fresh tuna with spicy mayo", price: 14.99, category: "Sushi", is_available: true, is_spicy: true, image_url: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=400" },
            { restaurant_id: restaurant.id, name: "Edamame", description: "Steamed soybeans", price: 6.99, category: "Appetizers", is_available: true, is_vegetarian: true, image_url: "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=400" },
            { restaurant_id: restaurant.id, name: "Omakase Platter", description: "Chef's selection premium sushi", price: 45.99, category: "Sushi", is_available: true, is_exclusive: true, image_url: "https://images.unsplash.com/photo-1582450871972-ab5ca641643d?w=400" },
            { restaurant_id: restaurant.id, name: "Mochi Ice Cream", description: "Japanese rice cake dessert", price: 7.99, category: "Desserts", is_available: true, is_vegetarian: true, image_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400" }
          );
        }
        
        if (restaurant.name.includes("Spice") || restaurant.name.includes("Indian")) {
          menuItems.push(
            { restaurant_id: restaurant.id, name: "Butter Chicken", description: "Creamy tomato curry", price: 16.99, category: "Curries", is_available: true, is_spicy: true, image_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400" },
            { restaurant_id: restaurant.id, name: "Garlic Naan", description: "Fresh baked flatbread", price: 3.99, category: "Breads", is_available: true, is_vegetarian: true, image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400" },
            { restaurant_id: restaurant.id, name: "Samosa", description: "Crispy potato pastry", price: 6.99, category: "Appetizers", is_available: true, is_vegetarian: true, is_spicy: true, image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
            { restaurant_id: restaurant.id, name: "Royal Biryani", description: "Premium saffron rice with lamb", price: 42.99, category: "Curries", is_available: true, is_exclusive: true, is_spicy: true, image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
            { restaurant_id: restaurant.id, name: "Gulab Jamun", description: "Sweet milk dumplings", price: 6.99, category: "Desserts", is_available: true, is_vegetarian: true, image_url: "https://images.unsplash.com/photo-1589119908995-c6c8e05b8d53?w=400" }
          );
        }
        
        if (restaurant.name.includes("Taco") || restaurant.name.includes("Mexican")) {
          menuItems.push(
            { restaurant_id: restaurant.id, name: "Carne Asada Tacos", description: "Grilled steak tacos", price: 12.99, category: "Tacos", is_available: true, image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400" },
            { restaurant_id: restaurant.id, name: "Guacamole & Chips", description: "Fresh avocado dip", price: 8.99, category: "Appetizers", is_available: true, is_vegetarian: true, image_url: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=400" },
            { restaurant_id: restaurant.id, name: "Fish Tacos", description: "Battered fish with slaw", price: 13.99, category: "Tacos", is_available: true, image_url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400" },
            { restaurant_id: restaurant.id, name: "Lobster Nachos", description: "Premium nachos with lobster", price: 29.99, category: "Appetizers", is_available: true, is_exclusive: true, image_url: "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400" },
            { restaurant_id: restaurant.id, name: "Churros", description: "Fried dough with chocolate", price: 6.99, category: "Desserts", is_available: true, is_vegetarian: true, image_url: "https://images.unsplash.com/photo-1543363136-c66d8e4e4a7f?w=400" }
          );
        }
        
        if (restaurant.name.includes("Dragon") || restaurant.name.includes("Chinese")) {
          menuItems.push(
            { restaurant_id: restaurant.id, name: "Kung Pao Chicken", description: "Spicy chicken with peanuts", price: 14.99, category: "Main Dishes", is_available: true, is_spicy: true, image_url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400" },
            { restaurant_id: restaurant.id, name: "Spring Rolls", description: "Crispy vegetable rolls", price: 7.99, category: "Appetizers", is_available: true, is_vegetarian: true, image_url: "https://images.unsplash.com/photo-1593252719534-b28e88023c1e?w=400" },
            { restaurant_id: restaurant.id, name: "Fried Rice", description: "Classic fried rice", price: 11.99, category: "Rice & Noodles", is_available: true, image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400" },
            { restaurant_id: restaurant.id, name: "Peking Duck", description: "Premium roasted duck", price: 48.99, category: "Main Dishes", is_available: true, is_exclusive: true, image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400" },
            { restaurant_id: restaurant.id, name: "Mango Pudding", description: "Sweet mango dessert", price: 6.99, category: "Desserts", is_available: true, is_vegetarian: true, image_url: "https://images.unsplash.com/photo-1601312540606-76e3b84a6fc6?w=400" }
          );
        }
      }

      setStatus(`Creating ${menuItems.length} menu items...`);
      await base44.entities.MenuItem.bulkCreate(menuItems);
      setStatus(`✅ Successfully created ${menuItems.length} menu items!`);
      setComplete(true);

    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-4">Seed Menu Data</h1>
        <p className="text-gray-600 mb-6">
          This will add menu items to all your restaurants. Click below to start.
        </p>

        {status && (
          <div className={`p-4 rounded-lg mb-4 ${complete ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
            {complete && <CheckCircle className="w-5 h-5 inline mr-2" />}
            {status}
          </div>
        )}

        {!complete ? (
          <Button
            onClick={seedData}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Menu Items...
              </>
            ) : (
              "Create Menu Items"
            )}
          </Button>
        ) : (
          <div className="text-center">
            <p className="text-green-600 font-semibold mb-4">All done! 🎉</p>
            <p className="text-sm text-gray-600">
              Visit any restaurant to see the menu items!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
