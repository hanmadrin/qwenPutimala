'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchCategories, fetchBrands } from '@/lib/api';
import { useProductSearch } from '@/lib/hooks';

/**
 * Filter Sidebar Component for shop page
 */
export function FilterSidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  });

  // Get current filter values from URL
  const currentCategory = searchParams.get('category');
  const currentBrand = searchParams.get('brand');
  const currentSort = searchParams.get('sort') || 'newest';

  // Update filters when URL changes
  useState(() => {
    const loadFilters = async () => {
      try {
        const [cats, brandsData] = await Promise.all([
          fetchCategories(),
          fetchBrands(),
        ]);
        setCategories(cats);
        setBrands(brandsData);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadFilters();
  });

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === '' || value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    router.push(`/shop?${params.toString()}`);
  };

  // Handle price range submit
  const handlePriceSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (priceRange.min) {
      params.set('minPrice', priceRange.min);
    } else {
      params.delete('minPrice');
    }
    
    if (priceRange.max) {
      params.set('maxPrice', priceRange.max);
    } else {
      params.delete('maxPrice');
    }
    
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    router.push('/shop');
  };

  return (
    <aside className="space-y-6 rounded-lg bg-white p-4 shadow-md">
      {/* Sort Options */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Sort By</h3>
        <select
          value={currentSort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
        </select>
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Categories</h3>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="category"
                checked={!currentCategory}
                onChange={() => handleFilterChange('category', '')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              All Categories
            </label>
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  name="category"
                  value={category.slug}
                  checked={currentCategory === category.slug}
                  onChange={() => handleFilterChange('category', category.slug)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                {category.name} ({category.productCount || 0})
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {brands && brands.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Brands</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="brand"
                checked={!currentBrand}
                onChange={() => handleFilterChange('brand', '')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              All Brands
            </label>
            {brands.map((brand) => (
              <label
                key={brand.id}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  name="brand"
                  value={brand.slug}
                  checked={currentBrand === brand.slug}
                  onChange={() => handleFilterChange('brand', brand.slug)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                {brand.name} ({brand.productCount || 0})
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Price Range</h3>
        <form onSubmit={handlePriceSubmit} className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Clear Filters */}
      {(currentCategory || currentBrand || priceRange.min || priceRange.max) && (
        <button
          onClick={clearAllFilters}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Clear All Filters
        </button>
      )}
    </aside>
  );
}
