import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, DollarSign, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, change, color }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {change && (
          <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% from yesterday
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const stats = [
    { icon: DollarSign, title: 'Total Sales', value: '৳45,231', change: 12.5, color: 'bg-green-500' },
    { icon: ShoppingCart, title: 'Orders', value: '234', change: 8.2, color: 'bg-blue-500' },
    { icon: Package, title: 'Products', value: '1,456', change: -2.1, color: 'bg-purple-500' },
    { icon: TrendingUp, title: 'Customers', value: '892', change: 15.3, color: 'bg-orange-500' },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'John Doe', amount: '৳2,500', status: 'Completed', date: '2024-08-17' },
    { id: '#ORD-002', customer: 'Jane Smith', amount: '৳1,800', status: 'Pending', date: '2024-08-17' },
    { id: '#ORD-003', customer: 'Mike Johnson', amount: '৳3,200', status: 'Processing', date: '2024-08-16' },
    { id: '#ORD-004', customer: 'Sarah Williams', amount: '৳950', status: 'Completed', date: '2024-08-16' },
    { id: '#ORD-005', customer: 'David Brown', amount: '৳4,100', status: 'Cancelled', date: '2024-08-15' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{order.customer}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
