'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { CartItem, MenuItem } from '@/lib/types'

interface CartState {
  items: CartItem[]
  restaurantId: string | null
  restaurantName: string | null
}

type CartAction =
  | { type: 'ADD_ITEM'; item: MenuItem; restaurantId: string; restaurantName: string }
  | { type: 'REMOVE_ITEM'; menuItemId: string }
  | { type: 'UPDATE_QTY'; menuItemId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_INSTRUCTIONS'; menuItemId: string; instructions: string }

interface CartContextValue {
  items: CartItem[]
  restaurantId: string | null
  restaurantName: string | null
  totalItems: number
  subtotal: number
  addItem: (item: MenuItem, restaurantId: string, restaurantName: string) => void
  removeItem: (menuItemId: string) => void
  updateQty: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  setInstructions: (menuItemId: string, instructions: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      if (state.restaurantId && state.restaurantId !== action.restaurantId) {
        // Different restaurant — replace cart
        return {
          restaurantId: action.restaurantId,
          restaurantName: action.restaurantName,
          items: [{ menuItem: action.item, quantity: 1, restaurantId: action.restaurantId, restaurantName: action.restaurantName }],
        }
      }
      const existing = state.items.find(i => i.menuItem.id === action.item.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.menuItem.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return {
        restaurantId: action.restaurantId,
        restaurantName: action.restaurantName,
        items: [...state.items, { menuItem: action.item, quantity: 1, restaurantId: action.restaurantId, restaurantName: action.restaurantName }],
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.menuItem.id !== action.menuItemId),
        restaurantId: state.items.length <= 1 ? null : state.restaurantId,
        restaurantName: state.items.length <= 1 ? null : state.restaurantName,
      }
    case 'UPDATE_QTY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.menuItem.id !== action.menuItemId) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.menuItem.id === action.menuItemId ? { ...i, quantity: action.quantity } : i
        ),
      }
    case 'SET_INSTRUCTIONS':
      return {
        ...state,
        items: state.items.map(i =>
          i.menuItem.id === action.menuItemId ? { ...i, specialInstructions: action.instructions } : i
        ),
      }
    case 'CLEAR_CART':
      return { items: [], restaurantId: null, restaurantName: null }
    default:
      return state
  }
}

const STORAGE_KEY = '7dash_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], restaurantId: null, restaurantName: null }, (init) => {
    if (typeof window === 'undefined') return init
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : init
    } catch {
      return init
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const subtotal = state.items.reduce((sum, i) => {
    const price = i.menuItem.discount_price ?? i.menuItem.price
    return sum + price * i.quantity
  }, 0)

  return (
    <CartContext.Provider value={{
      items: state.items,
      restaurantId: state.restaurantId,
      restaurantName: state.restaurantName,
      totalItems: state.items.reduce((s, i) => s + i.quantity, 0),
      subtotal,
      addItem: (item, restaurantId, restaurantName) => dispatch({ type: 'ADD_ITEM', item, restaurantId, restaurantName }),
      removeItem: (menuItemId) => dispatch({ type: 'REMOVE_ITEM', menuItemId }),
      updateQty: (menuItemId, quantity) => dispatch({ type: 'UPDATE_QTY', menuItemId, quantity }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      setInstructions: (menuItemId, instructions) => dispatch({ type: 'SET_INSTRUCTIONS', menuItemId, instructions }),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
