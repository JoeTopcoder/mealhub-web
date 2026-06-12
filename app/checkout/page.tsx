'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, CreditCard, Loader2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '@/components/cart/CartProvider'
import { createClient } from '@/lib/supabase/client'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '$'
const DELIVERY_FEE = 5.0
const SERVICE_FEE_RATE = 0.029
const SERVICE_FLAT = 1.30

function CheckoutForm() {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const { items, subtotal, restaurantId, clearCart } = useCart()
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const serviceFee = parseFloat(((subtotal * SERVICE_FEE_RATE) + SERVICE_FLAT).toFixed(2))
  const total = subtotal + DELIVERY_FEE + serviceFee

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    if (!address.trim()) { setError('Please enter a delivery address'); return }
    if (items.length === 0) { router.push('/cart'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // Get user profile for user_id
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) { setError('User profile not found'); setLoading(false); return }

    try {
      // Create payment intent via Supabase edge function
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            action: 'create_payment_intent',
            amount: Math.round(total * 100),
            currency: 'usd',
          }),
        }
      )
      const intentData = await res.json()
      if (!intentData.client_secret) throw new Error(intentData.error ?? 'Failed to create payment')

      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentData.client_secret,
        { payment_method: { card: elements.getElement(CardElement)! } }
      )
      if (stripeError) throw new Error(stripeError.message)

      // Create order in Supabase
      const orderItems = items.map(i => ({
        menu_item_id: i.menuItem.id,
        item_name: i.menuItem.name,
        quantity: i.quantity,
        unit_price: i.menuItem.discount_price ?? i.menuItem.price,
        total_price: (i.menuItem.discount_price ?? i.menuItem.price) * i.quantity,
      }))

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: profile.id,
          restaurant_id: restaurantId,
          subtotal,
          delivery_fee: DELIVERY_FEE,
          total_amount: total,
          status: 'pending',
          payment_status: 'completed',
          payment_method: 'card',
          delivery_address: address,
          notes: notes || null,
          ordered_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (orderErr) throw new Error(orderErr.message)

      // Insert order items
      await supabase.from('order_items').insert(
        orderItems.map(oi => ({ ...oi, order_id: order.id }))
      )

      // Record payment
      await supabase.from('payments').insert({
        order_id: order.id,
        user_id: profile.id,
        amount: total,
        currency: 'usd',
        payment_method: 'stripe',
        status: 'completed',
        stripe_payment_intent_id: paymentIntent?.id,
      })

      clearCart()
      router.push(`/orders/${order.id}?success=1`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Delivery address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
            rows={2}
            placeholder="Enter your full delivery address"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>
      </div>

      {/* Special notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Order notes <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="e.g. Leave at door, no bell"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      {/* Card */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <CreditCard className="inline w-4 h-4 mr-1 text-gray-400" />
          Payment
        </label>
        <div className="border border-gray-200 rounded-xl p-3.5 bg-white">
          <CardElement options={{ style: { base: { fontSize: '14px', color: '#111827' } } }} />
        </div>
      </div>

      {/* Total */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between"><span>Subtotal</span><span>{CURRENCY}{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>{CURRENCY}{DELIVERY_FEE.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Service fee</span><span>{CURRENCY}{serviceFee.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
          <span>Total</span><span>{CURRENCY}{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-purple-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : `Pay ${CURRENCY}${total.toFixed(2)}`}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const { items, totalItems } = useCart()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (totalItems === 0) { router.push('/cart'); return }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/login?next=/checkout')
      else setAuthChecked(true)
    })
  }, [totalItems, router])

  if (!authChecked) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  )
}
