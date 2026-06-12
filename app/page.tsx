import { createClient } from '@/lib/supabase/server'
import { Restaurant } from '@/lib/types'
import RestaurantCard from '@/components/restaurants/RestaurantCard'
import { Search } from 'lucide-react'

const CATEGORIES = [
  { emoji: '🍳', name: 'Breakfast' },
  { emoji: '🍔', name: 'Fast Food' },
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🍗', name: 'Chicken' },
  { emoji: '🌮', name: 'Mexican' },
  { emoji: '🍜', name: 'Chinese' },
  { emoji: '🍣', name: 'Sushi' },
  { emoji: '🥗', name: 'Healthy' },
  { emoji: '🍰', name: 'Dessert' },
  { emoji: '☕', name: 'Coffee' },
]

interface HomePageProps {
  searchParams: Promise<{ q?: string; category?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q, category } = await searchParams

  let restaurants: Restaurant[] = []
  let dbError = false

  try {
    const supabase = await createClient()
    let query = supabase
      .from('restaurants')
      .select('*')
      .eq('is_verified', true)
      .order('rating', { ascending: false })

    if (q) {
      query = query.or(`name.ilike.%${q}%,cuisine_type.ilike.%${q}%,description.ilike.%${q}%`)
    }
    if (category) {
      query = query.ilike('cuisine_type', `%${category}%`)
    }

    const { data, error } = await query.returns<Restaurant[]>()
    if (error) dbError = true
    else restaurants = data ?? []
  } catch {
    dbError = true
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center py-10 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          What are you craving?
        </h1>
        <p className="text-gray-500 mb-6">Order from the best local restaurants</p>

        {/* Search */}
        <form method="GET" className="max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              name="q"
              defaultValue={q}
              type="text"
              placeholder="Search restaurants or cuisines…"
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-gray-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        <a
          href="/"
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            !category ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
          }`}
        >
          All
        </a>
        {CATEGORIES.map(cat => (
          <a
            key={cat.name}
            href={`/?category=${cat.name}`}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              category === cat.name
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
            }`}
          >
            {cat.emoji} {cat.name}
          </a>
        ))}
      </div>

      {/* DB error banner */}
      {dbError && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl p-4 text-center">
          Could not load restaurants — please check your environment variables in Vercel and redeploy.
        </div>
      )}

      {/* Results count */}
      {(q || category) && (
        <p className="text-sm text-gray-500 mb-4">
          {restaurants?.length ?? 0} restaurant{restaurants?.length !== 1 ? 's' : ''} found
          {q ? ` for "${q}"` : ''}
          {category ? ` in ${category}` : ''}
        </p>
      )}

      {/* Restaurant grid */}
      {restaurants.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-gray-500 font-medium">No restaurants found</p>
          <a href="/" className="mt-4 inline-block text-sm text-purple-600 hover:underline">Clear filters</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {restaurants.map(r => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  )
}
