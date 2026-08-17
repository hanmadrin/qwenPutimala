// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// App Configuration
export const APP_NAME = 'Ecommerce POS BD';
export const ITEMS_PER_PAGE = 12;
export const MAX_CART_QUANTITY = 99;

// Feature Flags
export const FEATURES = {
  ENABLE_OTP_LOGIN: true,
  ENABLE_GUEST_CHECKOUT: true,
  ENABLE_PRODUCT_REVIEWS: true,
  ENABLE_WISHLIST: false, // Future feature
};
