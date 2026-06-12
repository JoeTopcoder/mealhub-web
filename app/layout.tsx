import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/cart/CartProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: '7Dash — Food. Fast. Delivered.',
  description: 'Order food from your favourite local restaurants',
}

export default async function RootLayout({ children }: { children: import('react').ReactNode }) {
  let profile = null
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', authUser.id)
        .single()
      profile = data
    }
  } catch {
    // Supabase unavailable or env vars missing — render without auth
  }

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-gray-50">
        <CartProvider>
          <Navbar user={profile} />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
