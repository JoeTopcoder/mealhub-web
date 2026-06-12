import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Star, Clock, Bike, MapPin } from 'lucide-react'
import { MenuItem, Restaurant } from '@/lib/types'
import AddToCartButton from './AddToCartButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '$'

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single<Restaurant>()

  if (!restaurant) notFound()

  const { data: menuItems } = await supabase
    .from('menus')
    .select('*')
    .eq('restaurant_id', id)
    .eq('is_available', true)
    .order('category')
    .returns<MenuItem[]>()

  // Group by category
  const grouped: Record<string, MenuItem[]> = {}
  for (const item of (menuItems ?? [])) {
    const cat = item.category ?? 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden bg-gray-100 mb-6">
        {restaurant.image_url ? (
          <Image src={restaurant.image_url} alt={restaurant.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50 text-8xl">
            🍽️
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          {restaurant.description && (
            <p className="text-sm text-white/80 mt-1 line-clamp-2">{restaurant.description}</p>
          )}
        </div>
        {!restaurant.is_open && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            Currently Closed
          </div>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-8 bg-white border border-gray-100 rounded-2xl p-4">
        <span className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <strong className="text-gray-900">{restaurant.rating?.toFixed(1) ?? '—'}</strong>
          {restaurant.total_reviews ? ` (${restaurant.total_reviews})` : ''}
        </span>
        {restaurant.estimated_delivery_time && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-400" />
            {restaurant.estimated_delivery_time} min
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Bike className="w-4 h-4 text-purple-400" />
          {restaurant.delivery_fee && restaurant.delivery_fee > 0
            ? `${currency}${restaurant.delivery_fee.toFixed(2)} delivery`
            : 'Free delivery'}
        </span>
        {restaurant.address && (
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-purple-400" />
            {restaurant.address}
          </span>
        )}
      </div>

      {/* Menu */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🍽️</p>
          <p>No menu items available right now.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                    {item.image_url && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-purple-700 text-sm">
                            {currency}{(item.discount_price ?? item.price).toFixed(2)}
                          </span>
                          {item.discount_price && item.discount_price < item.price && (
                            <span className="text-xs text-gray-400 line-through">
                              {currency}{item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <AddToCartButton
                          item={item}
                          restaurantId={restaurant.id}
                          restaurantName={restaurant.name}
                          disabled={!restaurant.is_open}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
