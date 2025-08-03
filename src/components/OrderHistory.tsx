import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Package, CheckCircle, Truck } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

interface Order {
  id: string
  restaurant_id: string
  total_amount: number
  status: string
  delivery_address: string
  created_at: string
  restaurants: {
    name: string
    image_url: string
  }
  order_items: {
    quantity: number
    price: number
    menu_items: {
      name: string
    }
  }[]
}

interface OrderHistoryProps {
  onClose: () => void
}

export const OrderHistory = ({ onClose }: OrderHistoryProps) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants(name, image_url),
          order_items(quantity, price, menu_items(name))
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="w-4 h-4" />
      case 'preparing':
        return <Package className="w-4 h-4" />
      case 'ready':
      case 'picked_up':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'confirmed': return 'bg-blue-500'
      case 'preparing': return 'bg-orange-500'
      case 'ready': return 'bg-purple-500'
      case 'picked_up': return 'bg-indigo-500'
      case 'delivered': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-gradient-fresh p-4 text-white shadow-fresh">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Order History</h1>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
            ✕
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Start ordering to see your history here</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="hover:shadow-fresh transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <img
                      src={order.restaurants?.image_url || "/placeholder.svg"}
                      alt={order.restaurants?.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <CardTitle className="text-base">{order.restaurants?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.toUpperCase()}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-3">
                  {order.order_items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.menu_items?.name} x {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="font-semibold">Total: ₹{order.total_amount}</span>
                  <Button variant="outline" size="sm">
                    Reorder
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}