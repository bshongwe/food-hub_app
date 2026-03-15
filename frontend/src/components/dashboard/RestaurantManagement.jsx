import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function RestaurantManagement({ restaurants, userEmail }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    cuisine_type: "American",
    rating: 4.5,
    delivery_time: "30-45 min",
    minimum_order: 15,
    delivery_fee: 3.99,
    address: "",
    phone: "",
    is_open: true,
    owner_email: userEmail,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Restaurant.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRestaurants'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Restaurant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRestaurants'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Restaurant.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRestaurants'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image_url: "",
      cuisine_type: "American",
      rating: 4.5,
      delivery_time: "30-45 min",
      minimum_order: 15,
      delivery_fee: 3.99,
      address: "",
      phone: "",
      is_open: true,
      owner_email: userEmail,
    });
    setEditingRestaurant(null);
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData(restaurant);
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRestaurant) {
      updateMutation.mutate({ id: editingRestaurant.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your Restaurants</h2>
        <Button onClick={() => setShowDialog(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      {restaurants.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No restaurants yet. Create your first one!</p>
      ) : (
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="p-4">
              <div className="flex items-center gap-4">
                <img
                  src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'}
                  alt={restaurant.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600">{restaurant.cuisine_type}</p>
                  <p className="text-sm text-gray-500">{restaurant.address}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleEdit(restaurant)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this restaurant?')) {
                        deleteMutation.mutate(restaurant.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRestaurant ? 'Edit' : 'Add'} Restaurant</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... keep existing code (form fields) */}
            <div>
              <Label>Restaurant Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cuisine Type *</Label>
                <Select value={formData.cuisine_type} onValueChange={(value) => setFormData({...formData, cuisine_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Italian", "Chinese", "Japanese", "Mexican", "Indian", "American", "Thai", "Mediterranean"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Delivery Time</Label>
                <Input
                  value={formData.delivery_time}
                  onChange={(e) => setFormData({...formData, delivery_time: e.target.value})}
                  placeholder="30-45 min"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Order ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.minimum_order}
                  onChange={(e) => setFormData({...formData, minimum_order: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <Label>Delivery Fee ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.delivery_fee}
                  onChange={(e) => setFormData({...formData, delivery_fee: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowDialog(false);
                resetForm();
              }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
                {editingRestaurant ? 'Update' : 'Create'} Restaurant
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
