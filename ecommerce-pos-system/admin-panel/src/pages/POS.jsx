import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, QrCode } from 'lucide-react';

const POS = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState('');

  // Sample products data
  const products = [
    { id: 1, name: 'Product A', price: 250, category: 'electronics', stock: 15, image: '📱' },
    { id: 2, name: 'Product B', price: 450, category: 'electronics', stock: 8, image: '🎧' },
    { id: 3, name: 'Product C', price: 1200, category: 'clothing', stock: 20, image: '👕' },
    { id: 4, name: 'Product D', price: 800, category: 'clothing', stock: 12, image: '👖' },
    { id: 5, name: 'Product E', price: 350, category: 'books', stock: 30, image: '📚' },
    { id: 6, name: 'Product F', price: 150, category: 'books', stock: 25, image: '📖' },
    { id: 7, name: 'Product G', price: 500, category: 'home', stock: 10, image: '🏠' },
    { id: 8, name: 'Product H', price: 750, category: 'home', stock: 18, image: '🛋️' },
  ];

  const categories = ['all', 'electronics', 'clothing', 'books', 'home'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return null;
        }
        const product = products.find(p => p.id === productId);
        if (newQuantity > product.stock) {
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const completeOrder = () => {
    // Here you would send the order to the backend
    console.log('Order completed:', {
      items: cart,
      total: cartTotal,
      paymentMethod,
      receivedAmount: parseFloat(receivedAmount)
    });
    
    // Reset cart and close modal
    setCart([]);
    setShowPaymentModal(false);
    setReceivedAmount('');
    alert('Order completed successfully!');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-4xl mb-2">{product.image}</div>
                <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                <p className="text-primary-600 font-bold mt-1">৳{product.price}</p>
                <p className="text-sm text-gray-500 mt-1">Stock: {product.stock}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white rounded-lg shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Current Order</h2>
          <p className="text-sm text-gray-600">{cartItemCount} items</p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
              <p>Cart is empty</p>
              <p className="text-sm">Add products to start an order</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-primary-600 font-bold">৳{item.price * item.quantity}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>৳{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (5%)</span>
              <span>৳{(cartTotal * 0.05).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>৳{(cartTotal * 1.05).toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Complete Payment</h2>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Total Amount</p>
              <p className="text-3xl font-bold text-primary-600">৳{(cartTotal * 1.05).toFixed(2)}</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-3">Payment Method</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 ${
                    paymentMethod === 'cash' 
                      ? 'border-primary-600 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Banknote size={24} className={paymentMethod === 'cash' ? 'text-primary-600' : 'text-gray-400'} />
                  <span className="text-sm font-medium">Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 ${
                    paymentMethod === 'card' 
                      ? 'border-primary-600 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard size={24} className={paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-400'} />
                  <span className="text-sm font-medium">Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('mobile')}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 ${
                    paymentMethod === 'mobile' 
                      ? 'border-primary-600 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <QrCode size={24} className={paymentMethod === 'mobile' ? 'text-primary-600' : 'text-gray-400'} />
                  <span className="text-sm font-medium">Mobile</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="mb-6">
                <label className="block text-gray-600 mb-2">Received Amount</label>
                <input
                  type="number"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  placeholder="Enter amount received"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {receivedAmount && parseFloat(receivedAmount) >= (cartTotal * 1.05) && (
                  <p className="text-green-600 mt-2">
                    Change: ৳{(parseFloat(receivedAmount) - (cartTotal * 1.05)).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={completeOrder}
                disabled={paymentMethod === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < (cartTotal * 1.05))}
                className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
