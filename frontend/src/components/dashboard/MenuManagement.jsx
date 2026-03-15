import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function MenuManagement({ restaurants }) {
  const queryClient = useQueryClient();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants[0]?.id || '');
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    restaurant_id: selectedRestaurantId,
    name: "",
    description: "",
    price: 0,
    image_url: "",
    category: "Main Course",
    is_available: true,
    is_vegetarian: false,
    is_spicy: false,
    is_exclusive: false, // Added for multi-tenant SaaS
  });

  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);
  const canAddExclusive = selectedRestaurant?.subscription_tier === 'pro';

  const { data: menuItems } = useQuery({
    queryKey: ['menuItems', selectedRestaurantId],
    queryFn: () => base44.entities.MenuItem.filter({ restaurant_id: selectedRestaurantId }),
    initialData: [],
    enabled: !!selectedRestaurantId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MenuItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', selectedRestaurantId] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MenuItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', selectedRestaurantId] });
      setShowDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MenuItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', selectedRestaurantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      restaurant_id: selectedRestaurantId,
      name: "",
      description: "",
      price: 0,
      image_url: "",
      category: "Main Course",
      is_available: true,
      is_vegetarian: false,
      is_spicy: false,
      is_exclusive: false, // Added for multi-tenant SaaS
    });
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
        ...formData,
        // Ensure is_exclusive is only set if the restaurant has the 'pro' tier
        is_exclusive: canAddExclusive ? formData.is_exclusive : false,
    };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  // Effect to reset form data restaurant_id when selectedRestaurantId changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      restaurant_id: selectedRestaurantId,
    }));
  }, [selectedRestaurantId]);


  if (restaurants.length === 0) {
    return <p className="text-center text-gray-500 py-8">Create a restaurant first to add menu items.</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Select value={selectedRestaurantId} onValueChange={(value) => {
          setSelectedRestaurantId(value);
          // formData restaurant_id is updated via useEffect now
          resetForm(); // Reset form when restaurant changes
          setShowDialog(false); // Close dialog if open
        }}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select restaurant" />
          </SelectTrigger>
          <SelectContent>
            {restaurants.map(r => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => {
          resetForm(); // Reset form for new item
          setShowDialog(true);
        }} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {menuItems.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No menu items yet. Add your first dish!</p>
      ) : (
        <div className="grid gap-4">
          {menuItems.map((item) => (
            <Card key={item.id} className={`p-4 ${item.is_exclusive ? 'border-yellow-300 bg-yellow-50/50' : ''}`}>
              <div className="flex items-center gap-4">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                  <p className="text-orange-600 font-bold">${item.price.toFixed(2)}</p>
                  {item.is_exclusive && (
                    <p className="text-xs text-yellow-700 font-medium">Exclusive Item</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => {
                      if (confirm('Delete this menu item?')) {
                        deleteMutation.mutate(item.id);
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Item Name *</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price ($) *</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Appetizers, Main Course"
                />
              </div>
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
                />
                <Label htmlFor="available">Available</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="vegetarian"
                  checked={formData.is_vegetarian}
                  onCheckedChange={(checked) => setFormData({...formData, is_vegetarian: checked})}
                />
                <Label htmlFor="vegetarian">Vegetarian</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="spicy"
                  checked={formData.is_spicy}
                  onCheckedChange={(checked) => setFormData({...formData, is_spicy: checked})}
                />
                <Label htmlFor="spicy">Spicy</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="exclusive"
                  checked={formData.is_exclusive}
                  onCheckedChange={(checked) => setFormData({...formData, is_exclusive: checked})}
                  disabled={!canAddExclusive}
                />
                <Label htmlFor="exclusive" className={!canAddExclusive ? 'text-gray-400' : ''}>Exclusive</Label>
              </div>
            </div>
            
            {!canAddExclusive && (
                <p className="text-sm text-yellow-600">Upgrade to the Pro plan to add exclusive items.</p>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowDialog(false);
                resetForm();
              }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
                {editingItem ? 'Update' : 'Create'} Item
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
