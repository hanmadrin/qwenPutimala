'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Shopping Cart ({itemCount} items)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart.</p>
              <div className="mt-6">
                <Link
                  href="/shop"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  onClick={onClose}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex py-2">
                  {/* Product Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <Link 
                          href={`/product/${item.slug}`}
                          className="hover:text-primary-600 transition-colors line-clamp-2"
                          onClick={onClose}
                        >
                          {item.name}
                        </Link>
                        <p className="ml-4">
                          ৳{(item.discountPrice || item.price).toFixed(2)}
                        </p>
                      </div>
                      {item.variant && (
                        <p className="mt-1 text-sm text-gray-500">
                          Variant: {item.variant}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-1 items-end justify-between text-sm">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors rounded-l-md"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-gray-900 font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors rounded-r-md"
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="font-medium text-red-600 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer with Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p>৳{total.toFixed(2)}</p>
            </div>
            
            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="w-full text-sm text-red-600 hover:text-red-500 transition-colors"
            >
              Clear Cart
            </button>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
            >
              Checkout
            </Link>

            {/* Continue Shopping */}
            <Link
              href="/shop"
              onClick={onClose}
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
