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
    <div>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-800 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white font-medium mb-6">
              <span>🚀</span>
              <span>Fast delivery · Fresh food · Local flavours</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Hunger solved,<br />
              <span className="text-yellow-300">delivered fast.</span>
            </h1>
            <p className="text-purple-200 text-lg mb-10 max-w-lg">
              Order from hundreds of local restaurants. Enjoy great food at your door in minutes.
            </p>

            {/* Search bar */}
            <form method="GET" className="max-w-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-5 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  name="q"
                  defaultValue={q}
                  type="text"
                  placeholder="Search restaurants, cuisines, or dishes…"
                  className="w-full pl-13 pr-4 py-4 rounded-2xl text-gray-900 bg-white shadow-2xl text-sm focus:outline-none focus:ring-4 focus:ring-yellow-300/50 placeholder:text-gray-400"
                  style={{ paddingLeft: 52 }}
                />
                <button
                  type="submit"
                  className="absolute right-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Wave divider */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 48L1440 48L1440 16C1200 48 960 0 720 16C480 32 240 0 0 16V48Z" fill="#f9fafb" />
        </svg>
      </section>

      {/* ── Main content ── */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Category chips */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 mb-8 no-scrollbar">
            <a
              href="/"
              className={`flex-shrink-0 px-5 py-2 rounded-2xl text-sm font-semibold border-2 transition-all ${
                !category
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-600'
              }`}
            >
              All
            </a>
            {CATEGORIES.map(cat => (
              <a
                key={cat.name}
                href={`/?category=${cat.name}`}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2 rounded-2xl text-sm font-semibold border-2 transition-all ${
                  category === cat.name
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-600'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </a>
            ))}
          </div>

          {/* DB error banner */}
          {dbError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-4 text-center">
              Could not load restaurants. Please check your environment variables in Vercel and redeploy.
            </div>
          )}

          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                {category ? `${category} Restaurants` : q ? `Results for "${q}"` : 'Top Restaurants'}
              </h2>
              {(q || category) && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
            {(q || category) && (
              <a href="/" className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors">
                Clear filters ×
              </a>
            )}
          </div>

          {/* Restaurant grid */}
          {restaurants.length === 0 && !dbError ? (
            <div className="text-center py-24">
              <p className="text-6xl mb-4">🍽️</p>
              <p className="text-lg font-semibold text-gray-700 mb-1">No restaurants found</p>
              <p className="text-sm text-gray-400 mb-6">Try a different search or category</p>
              <a href="/"
                className="inline-flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold px-6 py-3 rounded-2xl hover:bg-purple-700 transition-colors shadow-md">
                Browse all restaurants
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restaurants.map((r, i) => (
                <div
                  key={r.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
                >
                  <RestaurantCard r={r} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
