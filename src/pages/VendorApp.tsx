import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Store, 
  Plus, 
  Edit3, 
  Trash2, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck,
  DollarSign,
  TrendingUp
} from "lucide-react";
import vendorImage from "@/assets/vendor-app.jpg";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "accepted" | "preparing" | "ready" | "picked_up";
  orderTime: string;
}

const VendorApp = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Farm Fresh Salad Bowl",
      description: "Mixed greens with organic vegetables and house dressing",
      price: 180,
      category: "Salads",
      available: true,
      image: "/placeholder.svg"
    },
    {
      id: "2",
      name: "Quinoa Power Bowl",
      description: "Protein-rich quinoa with roasted vegetables",
      price: 220,
      category: "Healthy",
      available: true,
      image: "/placeholder.svg"
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD001",
      customerName: "John Doe",
      items: [{ name: "Farm Fresh Salad Bowl", quantity: 2, price: 180 }],
      total: 360,
      status: "pending",
      orderTime: "2:30 PM"
    },
    {
      id: "ORD002", 
      customerName: "Jane Smith",
      items: [{ name: "Quinoa Power Bowl", quantity: 1, price: 220 }],
      total: 220,
      status: "accepted",
      orderTime: "2:45 PM"
    }
  ]);

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const addMenuItem = () => {
    if (newItem.name && newItem.price) {
      const item: MenuItem = {
        id: Date.now().toString(),
        name: newItem.name,
        description: newItem.description,
        price: Number(newItem.price),
        category: newItem.category || "Main",
        available: true,
        image: "/placeholder.svg"
      };
      setMenuItems(prev => [...prev, item]);
      setNewItem({ name: "", description: "", price: "", category: "" });
    }
  };

  const toggleItemAvailability = (itemId: string) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, available: !item.available } : item
      )
    );
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "accepted": return "bg-blue-500"; 
      case "preparing": return "bg-orange-500";
      case "ready": return "bg-green-500";
      case "picked_up": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const todayEarnings = orders
    .filter(order => order.status === "picked_up")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-vendor p-4 text-white shadow-vendor">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold">Green Garden Cafe</h1>
              <p className="text-sm opacity-90">Vendor Dashboard</p>
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
          src={vendorImage} 
          alt="Vendor Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-vendor/80 to-transparent flex items-center">
          <div className="p-4 text-white">
            <h2 className="text-lg font-semibold">Manage Your Restaurant</h2>
            <p className="text-sm opacity-90">Orders, Menu & Analytics</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Active Orders</h3>
              <Badge variant="outline">{orders.length} orders</Badge>
            </div>

            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-vendor transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">{order.orderTime}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 font-semibold">
                      Total: ₹{order.total}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <Button 
                        variant="vendor" 
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, "accepted")}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                    )}
                    {order.status === "accepted" && (
                      <Button 
                        variant="vendor" 
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, "preparing")}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Start Preparing
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button 
                        variant="vendor" 
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, "ready")}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Mark Ready
                      </Button>
                    )}
                    {order.status === "ready" && (
                      <Button 
                        variant="vendor" 
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, "picked_up")}
                      >
                        <Truck className="w-4 h-4 mr-1" />
                        Hand to Delivery
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Menu Items</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="vendor">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Item Name</Label>
                      <Input
                        id="name"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter item name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter item description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="Enter price"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newItem.category}
                        onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Enter category"
                      />
                    </div>
                    <Button onClick={addMenuItem} variant="vendor" className="w-full">
                      Add Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {menuItems.map((item) => (
              <Card key={item.id} className="hover:shadow-vendor transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <p className="text-sm font-semibold text-vendor mt-1">₹{item.price}</p>
                          <Badge variant="outline" className="mt-1">{item.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={item.available ? "vendor" : "outline"}
                            size="sm"
                            onClick={() => toggleItemAvailability(item.id)}
                          >
                            {item.available ? "Available" : "Unavailable"}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteMenuItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <h3 className="text-lg font-semibold">Restaurant Analytics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 mx-auto text-vendor mb-2" />
                  <p className="text-2xl font-bold text-vendor">₹{todayEarnings}</p>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Package className="w-8 h-8 mx-auto text-vendor mb-2" />
                  <p className="text-2xl font-bold text-vendor">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto text-vendor mb-2" />
                  <p className="text-2xl font-bold text-vendor">4.8★</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto text-vendor mb-2" />
                  <p className="text-2xl font-bold text-vendor">18m</p>
                  <p className="text-sm text-muted-foreground">Avg Prep Time</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorApp;