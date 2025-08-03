import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bike, 
  MapPin, 
  Clock, 
  DollarSign, 
  Navigation, 
  Phone, 
  CheckCircle,
  Package,
  Star,
  TrendingUp
} from "lucide-react";
import deliveryImage from "@/assets/delivery-app.jpg";

interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  restaurant: string;
  restaurantAddress: string;
  deliveryAddress: string;
  items: { name: string; quantity: number }[];
  total: number;
  deliveryFee: number;
  distance: string;
  estimatedTime: string;
  status: "available" | "accepted" | "picked_up" | "delivered";
  orderTime: string;
}

const DeliveryApp = () => {
  const [availableOrders, setAvailableOrders] = useState<DeliveryOrder[]>([
    {
      id: "DEL001",
      customerName: "John Doe",
      customerPhone: "+91 98765 43210",
      restaurant: "Green Garden Cafe",
      restaurantAddress: "123 Food Street, Sector 15",
      deliveryAddress: "456 Home Lane, Sector 18",
      items: [
        { name: "Farm Fresh Salad Bowl", quantity: 2 },
        { name: "Quinoa Power Bowl", quantity: 1 }
      ],
      total: 580,
      deliveryFee: 40,
      distance: "2.5 km",
      estimatedTime: "15 min",
      status: "available",
      orderTime: "3:15 PM"
    },
    {
      id: "DEL002",
      customerName: "Jane Smith", 
      customerPhone: "+91 87654 32109",
      restaurant: "Wood Fire Kitchen",
      restaurantAddress: "789 Pizza Plaza, Sector 12",
      deliveryAddress: "321 Work Complex, Sector 14",
      items: [
        { name: "Artisan Pizza", quantity: 1 }
      ],
      total: 320,
      deliveryFee: 30,
      distance: "1.8 km", 
      estimatedTime: "12 min",
      status: "available",
      orderTime: "3:30 PM"
    }
  ]);

  const [activeOrders, setActiveOrders] = useState<DeliveryOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<DeliveryOrder[]>([]);

  const acceptOrder = (orderId: string) => {
    const order = availableOrders.find(o => o.id === orderId);
    if (order) {
      setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
      setActiveOrders(prev => [...prev, { ...order, status: "accepted" }]);
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: DeliveryOrder["status"]) => {
    if (newStatus === "delivered") {
      const order = activeOrders.find(o => o.id === orderId);
      if (order) {
        setActiveOrders(prev => prev.filter(o => o.id !== orderId));
        setCompletedOrders(prev => [...prev, { ...order, status: newStatus }]);
      }
    } else {
      setActiveOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    }
  };

  const getStatusColor = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "available": return "bg-blue-500";
      case "accepted": return "bg-orange-500";
      case "picked_up": return "bg-green-500";
      case "delivered": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const todayEarnings = completedOrders.reduce((sum, order) => sum + order.deliveryFee, 0);
  const totalDeliveries = completedOrders.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-delivery p-4 text-white shadow-delivery">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bike className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold">FreshFlow Delivery</h1>
              <p className="text-sm opacity-90">Delivery Partner</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Today's Earnings</p>
            <p className="text-lg font-bold">₹{todayEarnings}</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-32 overflow-hidden">
        <img 
          src={deliveryImage} 
          alt="Delivery Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-delivery/80 to-transparent flex items-center">
          <div className="p-4 text-white">
            <h2 className="text-lg font-semibold">Ready to Deliver?</h2>
            <p className="text-sm opacity-90">Pick up orders and earn money</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="available" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">
              Available ({availableOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Available Orders Tab */}
          <TabsContent value="available" className="space-y-4">
            <h3 className="text-lg font-semibold">Available Orders</h3>
            
            {availableOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders available right now</p>
                  <p className="text-sm text-muted-foreground">Check back in a few minutes</p>
                </CardContent>
              </Card>
            ) : (
              availableOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-delivery transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">{order.restaurant}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-delivery text-white">
                          ₹{order.deliveryFee} Fee
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">{order.orderTime}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">Pickup:</p>
                          <p className="text-muted-foreground">{order.restaurantAddress}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">Delivery:</p>
                          <p className="text-muted-foreground">{order.deliveryAddress}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{order.distance}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{order.estimatedTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <p className="text-sm text-muted-foreground mb-2">Order Items:</p>
                        {order.items.map((item, index) => (
                          <p key={index} className="text-sm">
                            {item.name} x {item.quantity}
                          </p>
                        ))}
                        <p className="text-sm font-semibold mt-2">
                          Order Total: ₹{order.total}
                        </p>
                      </div>

                      <Button 
                        variant="delivery" 
                        className="w-full"
                        onClick={() => acceptOrder(order.id)}
                      >
                        Accept Order - Earn ₹{order.deliveryFee}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Active Orders Tab */}
          <TabsContent value="active" className="space-y-4">
            <h3 className="text-lg font-semibold">Active Deliveries</h3>
            
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bike className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active deliveries</p>
                  <p className="text-sm text-muted-foreground">Accept orders from the Available tab</p>
                </CardContent>
              </Card>
            ) : (
              activeOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-delivery transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">{order.restaurant}</p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-muted-foreground">{order.customerPhone}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Navigation className="w-4 h-4 mr-1" />
                          Navigate
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        {order.status === "accepted" && (
                          <Button 
                            variant="delivery" 
                            className="flex-1"
                            onClick={() => updateOrderStatus(order.id, "picked_up")}
                          >
                            <Package className="w-4 h-4 mr-1" />
                            Mark Picked Up
                          </Button>
                        )}
                        {order.status === "picked_up" && (
                          <Button 
                            variant="delivery" 
                            className="flex-1"
                            onClick={() => updateOrderStatus(order.id, "delivered")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4">
            <h3 className="text-lg font-semibold">Earnings & Stats</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 mx-auto text-delivery mb-2" />
                  <p className="text-2xl font-bold text-delivery">₹{todayEarnings}</p>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Package className="w-8 h-8 mx-auto text-delivery mb-2" />
                  <p className="text-2xl font-bold text-delivery">{totalDeliveries}</p>
                  <p className="text-sm text-muted-foreground">Deliveries</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 mx-auto text-delivery mb-2" />
                  <p className="text-2xl font-bold text-delivery">4.9★</p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto text-delivery mb-2" />
                  <p className="text-2xl font-bold text-delivery">95%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                {completedOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center">No completed deliveries yet</p>
                ) : (
                  <div className="space-y-3">
                    {completedOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-delivery">+₹{order.deliveryFee}</p>
                          <p className="text-sm text-muted-foreground">{order.distance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeliveryApp;