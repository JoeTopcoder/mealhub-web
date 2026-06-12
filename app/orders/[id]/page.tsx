import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, MapPin, ChevronLeft } from 'lucide-react'
import { Order, OrderItem, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
}

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { success } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: order } = await supabase
    .from('orders')
    .select('*, restaurant:restaurants(name, address, image_url), items:order_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single<Order & { restaurant: { name: string; address?: string } | null; items: OrderItem[] }>()

  if (!order) notFound()

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '$'
  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to orders
      </Link>

      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 rounded-2xl p-4 mb-6">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">Order placed successfully! We&apos;re preparing your food.</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="font-bold text-gray-900">{order.restaurant?.name}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Order #{order.id.slice(0, 8).toUpperCase()} ·{' '}
              {new Date(order.ordered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>

        {/* Progress bar */}
        {order.status !== 'cancelled' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              {STATUS_STEPS.filter(s => s !== 'out_for_delivery').map((step, i) => (
                <span
                  key={step}
                  className={i <= currentStep ? 'text-purple-600 font-medium' : ''}
                >
                  {ORDER_STATUS_LABELS[step as keyof typeof ORDER_STATUS_LABELS]?.split(' ')[0]}
                </span>
              ))}
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Items</h2>
        <div className="space-y-2">
          {order.items?.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.quantity}× {item.item_name}</span>
              <span className="font-medium text-gray-900">{currency}{item.total_price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5 text-sm text-gray-600">
          <div className="flex justify-between"><span>Subtotal</span><span>{currency}{order.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{currency}{order.delivery_fee.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-gray-900 text-base mt-2 pt-2 border-t border-gray-100">
            <span>Total</span><span>{currency}{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      {order.delivery_address && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-2">Delivery address</h2>
          <p className="text-sm text-gray-600 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            {order.delivery_address}
          </p>
        </div>
      )}

      {/* ETA */}
      {!['delivered', 'cancelled'].includes(order.status) && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <Clock className="w-4 h-4 text-purple-400" />
          Estimated delivery: 30–45 minutes
        </div>
      )}
    </div>
  )
}
