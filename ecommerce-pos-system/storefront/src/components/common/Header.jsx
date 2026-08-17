'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import CartDrawer from '@/components/cart/CartDrawer';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary-600">
            Ecommerce POS BD
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 md:flex">
            <Link href="/shop" className="text-sm font-medium hover:text-primary-600">
              Shop
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary-600">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary-600">
              Contact
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Hidden on mobile */}
            <button className="hidden text-gray-600 hover:text-primary-600 sm:block">
              <Search className="h-5 w-5" />
            </button>

            {/* Cart */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-gray-600 hover:text-primary-600"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Account */}
            <Link href="/account/dashboard" className="text-gray-600 hover:text-primary-600">
              <User className="h-5 w-5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="block text-gray-600 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/shop"
                className="px-2 py-2 text-sm font-medium hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/about"
                className="px-2 py-2 text-sm font-medium hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="px-2 py-2 text-sm font-medium hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/track-order"
                className="px-2 py-2 text-sm font-medium hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Track Order
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
