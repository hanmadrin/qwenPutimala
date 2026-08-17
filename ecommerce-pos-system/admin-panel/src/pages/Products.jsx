import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Products = () => {
  const products = [
    { id: 1, name: 'Product A', sku: 'SKU-001', category: 'Electronics', price: 250, stock: 15, status: 'active' },
    { id: 2, name: 'Product B', sku: 'SKU-002', category: 'Electronics', price: 450, stock: 8, status: 'active' },
    { id: 3, name: 'Product C', sku: 'SKU-003', category: 'Clothing', price: 1200, stock: 20, status: 'active' },
    { id: 4, name: 'Product D', sku: 'SKU-004', category: 'Clothing', price: 800, stock: 0, status: 'out_of_stock' },
    { id: 5, name: 'Product E', sku: 'SKU-005', category: 'Books', price: 350, stock: 30, status: 'active' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Product</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">SKU</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Category</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Price</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Stock</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
              <th className="text-right py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-6">
                  <p className="font-medium text-gray-900">{product.name}</p>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{product.sku}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{product.category}</td>
                <td className="py-4 px-6 text-sm font-bold text-gray-900">৳{product.price.toFixed(2)}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{product.stock}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status === 'active' ? 'Active' : 'Out of Stock'}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-blue-50 rounded-lg">
                      <Edit size={18} className="text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
