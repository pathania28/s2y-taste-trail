import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, ShoppingCart, Star, Clock, MapPin, Plus, Minus, User, History, Phone } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { OrderHistory } from "@/components/OrderHistory";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-freshflow.jpg";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rating: number;
  delivery_time: string;
  category: string;
}

interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const CustomerApp = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    address: "",
    phone: "",
    notes: ""
  });
  const [loading, setLoading] = useState(true);
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant.id);
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('available', true);

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedRestaurant || cart.length === 0) {
      toast({
        title: "Error",
        description: "Please select items to order",
        variant: "destructive",
      });
      return;
    }

    if (!orderDetails.address || !orderDetails.phone) {
      toast({
        title: "Error", 
        description: "Please fill in delivery address and phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: selectedRestaurant.id,
          total_amount: getTotalPrice(),
          status: 'pending',
          delivery_address: orderDetails.address,
          phone_number: orderDetails.phone,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order placed!",
        description: `Order #${order.id.slice(-6)} has been placed successfully`,
      });

      // Clear cart and close checkout
      setCart([]);
      setShowCheckout(false);
      setOrderDetails({ address: "", phone: "", notes: "" });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showOrderHistory) {
    return <OrderHistory onClose={() => setShowOrderHistory(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-fresh p-4 text-white shadow-fresh">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">FreshFlow</h1>
            <div className="flex items-center text-sm opacity-90">
              <MapPin className="w-4 h-4 mr-1" />
              Delivering to Home
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowOrderHistory(true)}>
                  <History className="w-5 h-5" />
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/20" onClick={signOut}>
                  <User className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowAuthModal(true)}>
                <User className="w-5 h-5" />
                Login
              </Button>
            )}
            <div className="relative">
              <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => cart.length > 0 && setShowCheckout(true)}>
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-accent text-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Fresh Food Delivery" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
          <div className="p-4 text-white">
            <h2 className="text-2xl font-bold mb-2">Farm Fresh to Your Door</h2>
            <p className="text-sm opacity-90">Fresh, organic ingredients delivered in 30 minutes</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={selectedRestaurant ? "Search menu items..." : "Search restaurants..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedRestaurant && (
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => {
              setSelectedRestaurant(null);
              setMenuItems([]);
              setCart([]);
              setSearchTerm("");
            }}
          >
            ← Back to Restaurants
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {!selectedRestaurant ? (
          <>
            <h3 className="text-lg font-semibold">Popular Restaurants</h3>
            {filteredRestaurants.map((restaurant) => (
              <Card 
                key={restaurant.id} 
                className="hover:shadow-fresh transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedRestaurant(restaurant)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{restaurant.name}</h4>
                      <p className="text-sm text-muted-foreground">{restaurant.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="text-sm">{restaurant.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{restaurant.delivery_time}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2">{restaurant.category}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{selectedRestaurant.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedRestaurant.description}</p>
            </div>
            {filteredMenuItems.map((item) => (
              <Card key={item.id} className="hover:shadow-fresh transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <Badge variant="outline" className="mt-1">{item.category}</Badge>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-primary">₹{item.price}</span>
                        <Button 
                          variant="customer" 
                          size="sm"
                          onClick={() => addToCart(item)}
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 shadow-lg">
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm">{item.name}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-semibold">₹{item.price * item.quantity}</span>
                </div>
              </div>
            ))}
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total: ₹{getTotalPrice()}</span>
                <Button variant="customer" onClick={() => setShowCheckout(true)}>
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />

      {/* Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Delivery Address *</Label>
              <Textarea
                id="address"
                value={orderDetails.address}
                onChange={(e) => setOrderDetails(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your complete delivery address"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={orderDetails.phone}
                onChange={(e) => setOrderDetails(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Special Instructions</Label>
              <Textarea
                id="notes"
                value={orderDetails.notes}
                onChange={(e) => setOrderDetails(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special instructions for the restaurant or delivery"
              />
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total: ₹{getTotalPrice()}</span>
              </div>
              <Button onClick={placeOrder} variant="customer" className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Place Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerApp;