export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  role: 'customer' | 'user' | 'driver' | 'restaurant' | 'admin'
  avatar_url?: string
  latitude?: number
  longitude?: number
  created_at: string
}

export interface Restaurant {
  id: string
  name: string
  description?: string
  address: string
  phone?: string
  email?: string
  image_url?: string
  cuisine_type?: string
  rating: number
  total_reviews?: number
  delivery_fee?: number
  min_order?: number
  estimated_delivery_time?: number
  is_open: boolean
  is_verified: boolean
  owner_id?: string
  created_at: string
}

export interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  description?: string
  price: number
  discount_price?: number
  image_url?: string
  category?: string
  is_available: boolean
  is_featured?: boolean
  preparation_time?: number
  calories?: number
  created_at: string
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  restaurantId: string
  restaurantName: string
  specialInstructions?: string
}

export interface Order {
  id: string
  user_id: string
  restaurant_id: string
  restaurant?: Restaurant
  driver_id?: string
  subtotal: number
  tax_amount?: number
  delivery_fee: number
  discount?: number
  total_amount: number
  status: OrderStatus
  delivery_address?: string
  notes?: string
  payment_method?: string
  payment_status: 'pending' | 'completed' | 'failed'
  ordered_at: string
  confirmed_at?: string
  completed_at?: string
  cancelled_at?: string
  user_rating?: number
  user_review?: string
  items?: OrderItem[]
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
  special_instructions?: string
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  out_for_delivery: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}
