'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Thank you for your purchase. Your order has been received.
          </p>

          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Order ID: <span className="font-mono">{orderId}</span>
            </p>
          )}

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-primary-600">1</span>
                </div>
                <p className="ml-3 text-sm text-gray-600">
                  You will receive an order confirmation email shortly
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-primary-600">2</span>
                </div>
                <p className="ml-3 text-sm text-gray-600">
                  We'll send you a tracking number once your order ships
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-primary-600">3</span>
                </div>
                <p className="ml-3 text-sm text-gray-600">
                  Expected delivery within 3-7 business days
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Continue Shopping
            </Link>
            
            <div className="pt-4">
              <Link
                href="/account/orders"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                View Your Orders →
              </Link>
            </div>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <Link href="/contact" className="font-medium text-primary-600 hover:text-primary-500">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
