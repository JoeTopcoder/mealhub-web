import Link from 'next/link'
import { UtensilsCrossed } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 text-white font-extrabold text-lg mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              MealHub
            </div>
            <p className="text-sm leading-relaxed">
              Fast food delivery from your favourite local restaurants.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Browse Restaurants</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">My Account</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} MealHub. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
