'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut, Menu, X, ChevronDown } from 'lucide-react'
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
  const [dropdownOpen, setDropdownOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Account'
  const initials = displayName[0]?.toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="rounded-xl bg-black overflow-hidden flex-shrink-0" style={{ width: 40, height: 40 }}>
              <img src="/logo.jpg" alt="7Dash" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              7Dash
            </span>
          </Link>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors">
              Restaurants
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow-purple-300 transition-all ml-1"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs text-gray-400 mb-0.5">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                      </div>
                      <Link href="/profile" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4 text-gray-400" /> Profile
                      </Link>
                      <Link href="/orders" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <ShoppingCart className="w-4 h-4 text-gray-400" /> My Orders
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-purple-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Sign in
                </Link>
                <Link href="/auth/signup"
                  className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-700 text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-purple-200 hover:opacity-90 transition-all">
                  Sign up free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-purple-50 transition-colors">
              <ShoppingCart className="w-5 h-5 text-purple-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center" style={{ width: 18, height: 18 }}>
                  {totalItems}
                </span>
              )}
            </Link>
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(v => !v)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          <Link href="/" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-purple-700 px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors">
            Restaurants
          </Link>
          {user ? (
            <>
              <Link href="/orders" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-purple-700 px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors">My Orders</Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-purple-700 px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors">Profile</Link>
              <button onClick={handleSignOut} className="block w-full text-left text-sm font-medium text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Sign in</Link>
              <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-purple-700 px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors">Sign up free</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
