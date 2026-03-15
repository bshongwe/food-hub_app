import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Truck, ShoppingBag, CreditCard, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    specialInstructions: "",
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const savedRestaurant = JSON.parse(localStorage.getItem('cartRestaurant') || 'null');
    
    if (savedCart.length === 0) {
      navigate(createPageUrl("Cart"));
      return;
    }
    
    setCart(savedCart);
    setRestaurant(savedRestaurant);

    // Load user data
    base44.auth.me().then(user => {
      setFormData(prev => ({
        ...prev,
        phone: user.phone || "",
        address: user.default_address || "",
      }));
    }).catch(() => {});
  }, []);

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      return await base44.entities.Order.create(orderData);
    },
    onSuccess: (order) => {
      localStorage.removeItem('cart');
      localStorage.removeItem('cartRestaurant');
      window.dispatchEvent(new Event('cartUpdated'));
      navigate(createPageUrl("Orders") + `?orderId=${order.id}`);
    },
    onError: (error) => {
      alert("Failed to place order: " + error.message);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!formData.phone) {
      alert("Please enter your phone number");
      return;
    }

    if (deliveryType === "delivery" && !formData.address) {
      alert("Please enter your delivery address");
      return;
    }

    const user = await base44.auth.me();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = deliveryType === "delivery" ? (restaurant?.delivery_fee || 0) : 0;
    const totalAmount = subtotal + deliveryFee;

    const orderData = {
      user_email: user.email,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      items: cart.map(item => ({
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      delivery_type: deliveryType,
      delivery_address: deliveryType === "delivery" ? formData.address : restaurant?.address,
      phone: formData.phone,
      special_instructions: formData.specialInstructions,
      status: "pending",
      payment_status: paymentMethod === "cash" ? "pending" : "paid",
      estimated_time: restaurant?.delivery_time || "30-45 min",
    };

    placeOrderMutation.mutate(orderData);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryType === "delivery" ? (restaurant?.delivery_fee || 0) : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate(createPageUrl("Cart"))}
            variant="ghost"
            size="icon"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Type */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Delivery Method</h3>
            <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
              <div className="flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                   onClick={() => setDeliveryType("delivery")}>
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Delivery</p>
                      <p className="text-sm text-gray-500">{restaurant?.delivery_time}</p>
                    </div>
                  </div>
                </Label>
                <span className="font-semibold">R{deliveryFee.toFixed(2)}</span>
              </div>

              <div className="flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                   onClick={() => setDeliveryType("pickup")}>
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Pickup</p>
                      <p className="text-sm text-gray-500">Usually ready in 15-20 min</p>
                    </div>
                  </div>
                </Label>
                <span className="font-semibold text-green-600">Free</span>
              </div>
            </RadioGroup>
          </Card>

          {/* Payment Method */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Payment Method</h3>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                   onClick={() => setPaymentMethod("card")}>
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Card Payment</p>
                      <p className="text-sm text-gray-500">Debit/Credit Card via PayFast</p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                   onClick={() => setPaymentMethod("cash")}>
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </Card>

          {/* Delivery Details */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">
              {deliveryType === "delivery" ? "Delivery Details" : "Contact Details"}
            </h3>
            <div className="space-y-4">
              {deliveryType === "delivery" && (
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Input
                    id="address"
                    required
                    placeholder="Enter your full address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="mt-1"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  required
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Add any special instructions for your order"
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Order Summary */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.quantity}x {item.name}</span>
                  <span className="font-semibold">R{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">R{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {deliveryType === "delivery" ? "Delivery Fee" : "Pickup Fee"}
                </span>
                <span className="font-semibold">R{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-orange-600">R{total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            disabled={placeOrderMutation.isPending}
            className="w-full h-14 text-lg bg-orange-500 hover:bg-orange-600"
          >
            {placeOrderMutation.isPending ? "Processing..." : 
             paymentMethod === "cash" ? `Place Order - R${total.toFixed(2)}` : 
             `Pay Now - R${total.toFixed(2)}`}
          </Button>

          {paymentMethod === "card" && (
            <p className="text-sm text-gray-500 text-center">
              You'll be redirected to PayFast secure payment page
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
