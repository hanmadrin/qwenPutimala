'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchProducts } from '@/lib/api';
import { ProductGrid } from '@/components/shop/ProductCard';
import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { Pagination } from '@/components/shop/Pagination';
import { useProductSearch } from '@/lib/hooks';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearch = useProductSearch(searchTerm, 500);

  // Load products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          page: parseInt(searchParams.get('page')) || 1,
          limit: 12,
          category: searchParams.get('category') || undefined,
          brand: searchParams.get('brand') || undefined,
          search: debouncedSearch || undefined,
          sort: searchParams.get('sort') || 'newest',
          minPrice: searchParams.get('minPrice') || undefined,
          maxPrice: searchParams.get('maxPrice') || undefined,
        };

        const data = await fetchProducts(params);
        
        setProducts(data.products || []);
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          totalItems: data.pagination?.totalItems || 0,
          itemsPerPage: data.pagination?.itemsPerPage || 12,
        });
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchParams, debouncedSearch]);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    window.history.pushState({}, '', `/shop?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    
    params.delete('page'); // Reset to first page on search
    window.history.pushState({}, '', `/shop?${params.toString()}`);
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Shop All Products
        </h1>
        <p className="mt-2 text-gray-600">
          {pagination.totalItems} {pagination.totalItems === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {/* Search Bar - Mobile */}
      <form onSubmit={handleSearchSubmit} className="mb-6 md:hidden">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Search
          </button>
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden lg:block">
          <FilterSidebar />
        </div>

        {/* Mobile Filter Toggle could be added here */}

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="mb-6 hidden md:block">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Search
              </button>
            </div>
          </form>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-8 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-12 text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              <ProductGrid products={products} columns={4} />
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
