'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/components/cart/CartProvider'

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '$'
const DELIVERY_FEE = 5.0
const SERVICE_FEE_RATE = 0.029
const SERVICE_FLAT = 1.30

export default function CartPage() {
  const { items, subtotal, totalItems, updateQty, removeItem, clearCart, restaurantName } = useCart()

  if (totalItems === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-6">Add items from a restaurant to get started</p>
        <Link href="/" className="bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
          Browse restaurants
        </Link>
      </div>
    )
  }

  const serviceFee = parseFloat(((subtotal * SERVICE_FEE_RATE) + SERVICE_FLAT).toFixed(2))
  const total = subtotal + DELIVERY_FEE + serviceFee

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 transition-colors">
          Clear cart
        </button>
      </div>

      {restaurantName && (
        <p className="text-sm text-gray-500 mb-4">From <strong className="text-gray-800">{restaurantName}</strong></p>
      )}

      {/* Items */}
      <div className="space-y-3 mb-6">
        {items.map(({ menuItem, quantity }) => (
          <div key={menuItem.id} className="flex gap-3 bg-white rounded-2xl border border-gray-100 p-4">
            {menuItem.image_url && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image src={menuItem.image_url} alt={menuItem.name} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{menuItem.name}</p>
              <p className="text-purple-700 text-sm font-bold mt-0.5">
                {CURRENCY}{((menuItem.discount_price ?? menuItem.price) * quantity).toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => removeItem(menuItem.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(menuItem.id, quantity - 1)}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
                <button
                  onClick={() => updateQty(menuItem.id, quantity + 1)}
                  className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 mb-5">
        <h3 className="font-semibold text-gray-900">Order summary</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{CURRENCY}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee</span>
            <span>{CURRENCY}{DELIVERY_FEE.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service fee</span>
            <span>{CURRENCY}{serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base">
            <span>Total</span>
            <span>{CURRENCY}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Link
        href="/checkout"
        className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-purple-700 transition-colors"
      >
        Proceed to checkout
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
