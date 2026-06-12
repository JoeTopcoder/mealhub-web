import Link from 'next/link'
import Image from 'next/image'
import { Star, Clock, Bike } from 'lucide-react'
import { Restaurant } from '@/lib/types'

export default function RestaurantCard({ r }: { r: Restaurant }) {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '$'

  return (
    <Link
      href={`/restaurants/${r.id}`}
      className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {r.image_url ? (
          <Image
            src={r.image_url}
            alt={r.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 via-violet-50 to-indigo-100 text-6xl">
            🍽️
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Closed overlay */}
        {!r.is_open && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-white text-gray-800 text-xs font-bold px-4 py-1.5 rounded-full shadow">
              Closed
            </span>
          </div>
        )}

        {/* Cuisine badge */}
        {r.cuisine_type && (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-full shadow-sm">
            {r.cuisine_type}
          </span>
        )}

        {/* Rating badge top-right */}
        {r.rating != null && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-xs font-bold text-gray-800 px-2 py-1 rounded-full shadow-sm">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {r.rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base leading-tight truncate group-hover:text-purple-700 transition-colors">
          {r.name}
        </h3>
        {r.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{r.description}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          {r.estimated_delivery_time && (
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              {r.estimated_delivery_time} min
            </span>
          )}
          <span className="flex items-center gap-1.5 font-medium">
            <Bike className="w-3.5 h-3.5 text-purple-400" />
            {r.delivery_fee && r.delivery_fee > 0
              ? `${currency}${r.delivery_fee.toFixed(2)} delivery`
              : 'Free delivery'}
          </span>
        </div>
      </div>
    </Link>
  )
}
