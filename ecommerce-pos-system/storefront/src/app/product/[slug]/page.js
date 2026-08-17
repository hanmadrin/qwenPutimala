'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProduct } from '@/lib/api';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const { slug } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  const { addItem } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchProduct(slug);
        setProduct(data);
        if (data?.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem(product, quantity, selectedVariant);
    
    // Show a simple notification (could be enhanced with a toast library)
    alert(`${quantity} x ${product.name} added to cart!`);
  };

  const incrementQuantity = () => {
    setQuantity(Math.min(quantity + 1, 99));
  };

  const decrementQuantity = () => {
    setQuantity(Math.max(quantity - 1, 1));
  };

  if (loading) {
    return (
      <div className="container-custom flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-20">
        <div className="rounded-lg bg-red-50 p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-800">Product Not Found</h2>
          <p className="mb-4 text-red-600">{error || 'The product you are looking for does not exist.'}</p>
          <Link href="/shop" className="text-primary-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const { id, name, description, price, discountPrice, images, category, brand, averageRating, reviewCount, stock, variants, specifications } = product;
  
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPercentage = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const isOutOfStock = stock <= 0;
  const mainImage = images?.[selectedImage]?.url || images?.[0]?.url || '/placeholder-product.jpg';

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-primary-600">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/shop" className="hover:text-primary-600">Shop</Link>
          </li>
          {category && (
            <>
              <li>/</li>
              <li>
                <Link href={`/shop?category=${category.slug}`} className="hover:text-primary-600">
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <li>/</li>
          <li className="text-gray-900">{name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 shadow-md">
            <Image
              src={mainImage}
              alt={name}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          
          {/* Thumbnail Images */}
          {images && images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 bg-gray-100 ${
                    selectedImage === index ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${name} ${index + 1}`}
                    fill
                    className="object-cover object-center"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category & Brand */}
          <div className="flex items-center gap-4 text-sm">
            {category && (
              <Link 
                href={`/shop?category=${category.slug}`}
                className="text-primary-600 hover:underline"
              >
                {category.name}
              </Link>
            )}
            {brand && (
              <>
                <span className="text-gray-300">|</span>
                <Link 
                  href={`/shop?brand=${brand.slug}`}
                  className="text-primary-600 hover:underline"
                >
                  {brand.name}
                </Link>
              </>
            )}
          </div>

          {/* Product Name */}
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {name}
          </h1>

          {/* Rating */}
          {averageRating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5"
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
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviewCount || 0} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="text-3xl font-bold text-red-600">
                  ৳{discountPrice.toLocaleString()}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ৳{price.toLocaleString()}
                </span>
                <span className="rounded bg-red-100 px-2 py-1 text-sm font-semibold text-red-600">
                  -{discountPercentage}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                ৳{price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className={`text-sm ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
            {isOutOfStock ? 'Out of Stock' : `In Stock (${stock} available)`}
          </div>

          {/* Description */}
          {description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">{description}</p>
            </div>
          )}

          {/* Variants */}
          {variants && variants.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Select Variant:</h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-300 text-gray-700 hover:border-primary-600'
                    }`}
                  >
                    {variant.name}
                    {variant.priceAdjustment !== 0 && (
                      <span className="ml-1 text-xs">
                        ({variant.priceAdjustment > 0 ? '+' : ''}৳{variant.priceAdjustment})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-md border border-gray-300">
                <button
                  onClick={decrementQuantity}
                  className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 rounded-md bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary-700"
              >
                Add to Cart
              </button>
            </div>
          )}

          {/* Specifications */}
          {specifications && specifications.length > 0 && (
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Specifications</h3>
              <dl className="space-y-2 text-sm">
                {specifications.map((spec) => (
                  <div key={spec.id} className="flex justify-between">
                    <dt className="text-gray-600">{spec.name}</dt>
                    <dd className="font-medium text-gray-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Related Products could be added here */}
    </div>
  );
}
