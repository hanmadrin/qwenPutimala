import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container-custom py-8">
      {/* Hero Section */}
      <section className="mb-12 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-12 text-white shadow-lg sm:px-12 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Welcome to Ecommerce POS BD
          </h1>
          <p className="mb-8 text-lg text-primary-100 sm:text-xl">
            Your one-stop shop for quality products across Bangladesh
          </p>
          <Link
            href="/shop"
            className="inline-block rounded-md bg-white px-6 py-3 text-base font-semibold text-primary-600 shadow-md transition-colors hover:bg-primary-50"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card-default p-6 text-center">
          <div className="mb-4 text-4xl">🚚</div>
          <h3 className="mb-2 text-lg font-semibold">Fast Delivery</h3>
          <p className="text-sm text-gray-600">Nationwide shipping within 2-5 business days</p>
        </div>
        <div className="card-default p-6 text-center">
          <div className="mb-4 text-4xl">💳</div>
          <h3 className="mb-2 text-lg font-semibold">Secure Payment</h3>
          <p className="text-sm text-gray-600">Multiple payment options including bKash, Nagad, and Cards</p>
        </div>
        <div className="card-default p-6 text-center">
          <div className="mb-4 text-4xl">🔄</div>
          <h3 className="mb-2 text-lg font-semibold">Easy Returns</h3>
          <p className="text-sm text-gray-600">7-day hassle-free return policy</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-lg bg-secondary-100 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">Ready to start shopping?</h2>
        <p className="mb-6 text-gray-600">Browse our collection of quality products</p>
        <Link
          href="/shop"
          className="btn-primary"
        >
          View All Products
        </Link>
      </section>
    </div>
  );
}
