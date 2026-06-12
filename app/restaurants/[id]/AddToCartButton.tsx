'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { useCart } from '@/components/cart/CartProvider'
import { MenuItem } from '@/lib/types'

interface Props {
  item: MenuItem
  restaurantId: string
  restaurantName: string
  disabled?: boolean
}

export default function AddToCartButton({ item, restaurantId, restaurantName, disabled }: Props) {
  const { addItem, items, restaurantId: cartRestaurantId } = useCart()
  const [added, setAdded] = useState(false)

  const inCart = items.some(i => i.menuItem.id === item.id)

  function handleAdd() {
    if (cartRestaurantId && cartRestaurantId !== restaurantId) {
      if (!confirm('Your cart has items from another restaurant. Replace cart?')) return
    }
    addItem(item, restaurantId, restaurantName)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
        added
          ? 'bg-green-500 text-white'
          : inCart
          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          : 'bg-purple-600 text-white hover:bg-purple-700'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {added ? (
        <><Check className="w-3.5 h-3.5" /> Added</>
      ) : (
        <><Plus className="w-3.5 h-3.5" /> {inCart ? 'Add more' : 'Add'}</>
      )}
    </button>
  )
}
