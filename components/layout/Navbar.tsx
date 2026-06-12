'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut, Menu, X, ChefHat } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  user?: { name?: string; email?: string } | null
}

export default function Navbar({ user }: NavbarProps) {
  const { totalItems } = useCart()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-purple-700">
            <ChefHat className="w-7 h-7 text-purple-600" />
            MealHub
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-purple-700 transition-colors">Restaurants</Link>
            {user && (
              <Link href="/orders" className="hover:text-purple-700 transition-colors">My Orders</Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-purple-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user.name || user.email?.split('@')[0] || 'Account'}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-medium bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100"
              onClick={() => setMenuOpen(v => !v)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-purple-700">Restaurants</Link>
          {user && (
            <Link href="/orders" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-purple-700">My Orders</Link>
          )}
          {user ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-purple-700">Profile</Link>
              <button onClick={handleSignOut} className="block text-sm font-medium text-red-500">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700">Sign in</Link>
              <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-purple-700">Sign up free</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
