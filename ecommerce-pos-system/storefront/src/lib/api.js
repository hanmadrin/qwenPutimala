import { API_URL } from './config';

/**
 * Fetch products with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.category - Category slug filter
 * @param {string} params.brand - Brand slug filter
 * @param {string} params.search - Search query
 * @param {string} params.sort - Sort order (newest, oldest, price-asc, price-desc)
 * @param {number} params.minPrice - Minimum price filter
 * @param {number} params.maxPrice - Maximum price filter
 */
export async function fetchProducts(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.category) queryParams.append('category', params.category);
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.search) queryParams.append('search', params.search);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.minPrice) queryParams.append('minPrice', params.minPrice);
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
  
  const url = `${API_URL}/products?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Fetch a single product by ID or slug
 */
export async function fetchProduct(idOrSlug) {
  const url = `${API_URL}/products/${idOrSlug}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * Fetch all categories
 */
export async function fetchCategories() {
  const url = `${API_URL}/categories`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Fetch all brands
 */
export async function fetchBrands() {
  const url = `${API_URL}/brands`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
}

/**
 * Customer OTP login - Request OTP
 */
export async function requestCustomerOTP(phone) {
  const url = `${API_URL}/auth/customer/otp/request`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error requesting OTP:', error);
    throw error;
  }
}

/**
 * Customer OTP login - Verify OTP
 */
export async function verifyCustomerOTP(phone, otp) {
  const url = `${API_URL}/auth/customer/otp/verify`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, otp }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
}

/**
 * Get customer profile
 */
export async function getCustomerProfile(token) {
  const url = `${API_URL}/customers/profile`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    throw error;
  }
}
