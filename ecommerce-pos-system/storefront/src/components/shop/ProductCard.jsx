'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * Product Card Component for shop listing
 */
export function ProductCard({ product }) {
  const { id, name, slug, price, discountPrice, images, category, brand, averageRating, reviewCount, stock } = product;

  // Use first image or placeholder
  const mainImage = images?.[0]?.url || '/placeholder-product.jpg';
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPercentage = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const isOutOfStock = stock <= 0;

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl">
      {/* Product Image */}
      <Link href={`/product/${slug}`} className="block aspect-square overflow-hidden bg-gray-100">
        <Image
          src={mainImage}
          alt={name}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        
        {/* Discount Badge */}
        {hasDiscount && !isOutOfStock && (
          <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
            -{discountPercentage}%
          </span>
        )}
        
        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <span className="absolute left-2 top-2 rounded bg-gray-800 px-2 py-1 text-xs font-semibold text-white">
            Out of Stock
          </span>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category & Brand */}
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
          {category && (
            <Link 
              href={`/shop?category=${category.slug}`}
              className="hover:text-primary-600"
            >
              {category.name}
            </Link>
          )}
          {brand && (
            <Link 
              href={`/shop?brand=${brand.slug}`}
              className="hover:text-primary-600"
            >
              {brand.name}
            </Link>
          )}
        </div>

        {/* Product Name */}
        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900 sm:text-base">
          <Link href={`/product/${slug}`} className="hover:text-primary-600">
            {name}
          </Link>
        </h3>

        {/* Rating */}
        {averageRating > 0 && (
          <div className="mb-2 flex items-center text-xs">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-3 w-3"
                  fill={i < Math.floor(averageRating) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
            <span className="ml-1 text-gray-600">({reviewCount || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="mb-3 flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold text-red-600">
                ৳{discountPrice.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ৳{price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              ৳{price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          disabled={isOutOfStock}
          className={`w-full rounded-md py-2 text-sm font-semibold transition-colors ${
            isOutOfStock
              ? 'cursor-not-allowed bg-gray-200 text-gray-400'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

/**
 * Product Grid Component
 */
export function ProductGrid({ products, columns = 4 }) {
  if (!products || products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  };

  return (
    <div className={`grid gap-4 sm:gap-6 ${gridCols[columns] || gridCols[4]}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
