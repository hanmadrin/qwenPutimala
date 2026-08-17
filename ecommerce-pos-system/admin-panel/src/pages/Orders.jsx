import React, { useState } from 'react';
import { Search, Eye, Printer, MoreVertical } from 'lucide-react';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample orders data
  const orders = [
    { id: '#ORD-001', customer: 'John Doe', phone: '+8801712345678', amount: 2500, items: 3, status: 'completed', date: '2024-08-17 10:30', type: 'walk-in', payment: 'cash' },
    { id: '#ORD-002', customer: 'Jane Smith', phone: '+8801812345678', amount: 1800, items: 2, status: 'pending', date: '2024-08-17 11:15', type: 'online', payment: 'bkash' },
    { id: '#ORD-003', customer: 'Mike Johnson', phone: '+8801912345678', amount: 3200, items: 5, status: 'processing', date: '2024-08-17 09:45', type: 'walk-in', payment: 'card' },
    { id: '#ORD-004', customer: 'Sarah Williams', phone: '+8801612345678', amount: 950, items: 1, status: 'completed', date: '2024-08-16 16:20', type: 'online', payment: 'cod' },
    { id: '#ORD-005', customer: 'David Brown', phone: '+8801512345678', amount: 4100, items: 4, status: 'cancelled', date: '2024-08-16 14:10', type: 'walk-in', payment: 'cash' },
    { id: '#ORD-006', customer: 'Emily Davis', phone: '+8801712345679', amount: 1250, items: 2, status: 'completed', date: '2024-08-16 12:30', type: 'online', payment: 'nakad' },
    { id: '#ORD-007', customer: 'Robert Wilson', phone: '+8801812345679', amount: 2800, items: 3, status: 'processing', date: '2024-08-15 18:45', type: 'walk-in', payment: 'card' },
    { id: '#ORD-008', customer: 'Lisa Anderson', phone: '+8801912345679', amount: 3500, items: 6, status: 'pending', date: '2024-08-15 15:20', type: 'online', payment: 'sslcommerz' },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadge = (type) => {
    return type === 'walk-in' 
      ? 'bg-purple-100 text-purple-800'
      : 'bg-indigo-100 text-indigo-800';
  };

  const stats = {
    total: orders.length,
    today: orders.filter(o => o.date.startsWith('2024-08-17')).length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage all walk-in and online orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Today's Orders</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.today}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Order ID</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Items</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Payment</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Date</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">{order.id}</td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(order.type)}`}>
                      {order.type === 'walk-in' ? 'Walk-in' : 'Online'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{order.items} items</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">৳{order.amount.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600 capitalize">{order.payment}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{order.date}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="View Details">
                        <Eye size={18} className="text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="Print Invoice">
                        <Printer size={18} className="text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
