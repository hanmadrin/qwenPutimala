'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to manage cart state in localStorage
 */
export function useCart() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isLoading]);

  // Add item to cart
  const addToCart = (product, quantity = 1, variant = null) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.variant) === JSON.stringify(variant)
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            product,
            quantity,
            variant,
            addedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId, variant = null) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.product.id === productId &&
            JSON.stringify(item.variant) === JSON.stringify(variant)
          )
      )
    );
  };

  // Update item quantity
  const updateQuantity = (productId, quantity, variant = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variant)
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get cart totals
  const getCartTotals = () => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return { totalItems, totalPrice };
  };

  return {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotals,
  };
}

/**
 * Hook to manage customer authentication state
 */
export function useCustomerAuth() {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('customer_token');
      const savedCustomer = localStorage.getItem('customer_data');

      if (savedToken && savedCustomer) {
        setToken(savedToken);
        setCustomer(JSON.parse(savedCustomer));
      }
    } catch (error) {
      console.error('Error loading customer auth from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken, customerData) => {
    localStorage.setItem('customer_token', newToken);
    localStorage.setItem('customer_data', JSON.stringify(customerData));
    setToken(newToken);
    setCustomer(customerData);
  };

  const logout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    setToken(null);
    setCustomer(null);
  };

  return {
    customer,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
  };
}

/**
 * Hook for product search with debouncing
 */
export function useProductSearch(searchTerm, delay = 300) {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return debouncedTerm;
}

/**
 * Hook to manage pagination state
 */
export function usePagination(initialPage = 1, itemsPerPage = 12) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  return {
    currentPage,
    totalPages,
    totalItems,
    setTotalItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
