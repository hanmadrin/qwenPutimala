import React from 'react';
import { Package, AlertTriangle } from 'lucide-react';

const Inventory = () => {
  const inventory = [
    { id: 1, product: 'Product A', sku: 'SKU-001', branch: 'Main Branch', stock: 15, minStock: 10, status: 'good' },
    { id: 2, product: 'Product B', sku: 'SKU-002', branch: 'Main Branch', stock: 8, minStock: 10, status: 'low' },
    { id: 3, product: 'Product C', sku: 'SKU-003', branch: 'Dhaka Branch', stock: 20, minStock: 15, status: 'good' },
    { id: 4, product: 'Product D', sku: 'SKU-004', branch: 'Dhaka Branch', stock: 0, minStock: 5, status: 'out_of_stock' },
    { id: 5, product: 'Product E', sku: 'SKU-005', branch: 'Chittagong Branch', stock: 30, minStock: 20, status: 'good' },
    { id: 6, product: 'Product F', sku: 'SKU-006', branch: 'Main Branch', stock: 3, minStock: 10, status: 'low' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalProducts: inventory.length,
    lowStock: inventory.filter(i => i.status === 'low').length,
    outOfStock: inventory.filter(i => i.status === 'out_of_stock').length,
    goodStock: inventory.filter(i => i.status === 'good').length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <p className="text-gray-600 mt-1">Track stock levels across all branches</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Good Stock</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.goodStock}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Package size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Product</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">SKU</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Branch</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Current Stock</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Min Stock</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-6">
                  <p className="font-medium text-gray-900">{item.product}</p>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{item.sku}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{item.branch}</td>
                <td className="py-4 px-6">
                  <span className={`font-bold ${item.stock <= item.minStock ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.stock}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{item.minStock}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                    {item.status === 'good' ? 'Good' : item.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
