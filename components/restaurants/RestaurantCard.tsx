import Link from 'next/link'
import Image from 'next/image'
import { Star, Clock, Bike } from 'lucide-react'
import { Restaurant } from '@/lib/types'

export default function RestaurantCard({ r }: { r: Restaurant }) {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '$'

  return (
    <Link href={`/restaurants/${r.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {r.image_url ? (
          <Image
            src={r.image_url}
            alt={r.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50 text-5xl">
            🍽️
          </div>
        )}
        {!r.is_open && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full">Closed</span>
          </div>
        )}
        {r.cuisine_type && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2.5 py-1 rounded-full">
            {r.cuisine_type}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-purple-700 transition-colors">
          {r.name}
        </h3>
        {r.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.description}</p>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-gray-700">{r.rating?.toFixed(1) ?? '—'}</span>
          </span>
          {r.estimated_delivery_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {r.estimated_delivery_time} min
            </span>
          )}
          <span className="flex items-center gap-1">
            <Bike className="w-3.5 h-3.5" />
            {r.delivery_fee && r.delivery_fee > 0 ? `${currency}${r.delivery_fee.toFixed(2)}` : 'Free delivery'}
          </span>
        </div>
      </div>
    </Link>
  )
}
