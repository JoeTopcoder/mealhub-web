import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types'
import { ClipboardList, ChevronRight } from 'lucide-react'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/orders')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, restaurant:restaurants(name, image_url)')
    .eq('user_id', user.id)
    .order('ordered_at', { ascending: false })
    .returns<(Order & { restaurant: { name: string; image_url?: string } | null })[]>()

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '$'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <Link href="/" className="mt-4 inline-block text-sm text-purple-600 hover:underline">
            Browse restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl flex-shrink-0">
                🍽️
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {order.restaurant?.name ?? 'Restaurant'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(order.ordered_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                  {' · '}
                  {currency}{order.total_amount.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
