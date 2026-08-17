import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 125430,
    totalOrders: 342,
    averageOrderValue: 367,
    totalCustomers: 189
  });

  const salesData = [
    { date: '2024-08-01', sales: 3200, orders: 12 },
    { date: '2024-08-02', sales: 4100, orders: 15 },
    { date: '2024-08-03', sales: 2800, orders: 9 },
    { date: '2024-08-04', sales: 5200, orders: 18 },
    { date: '2024-08-05', sales: 4800, orders: 16 },
    { date: '2024-08-06', sales: 6100, orders: 22 },
    { date: '2024-08-07', sales: 5500, orders: 19 },
  ];

  const topProducts = [
    { id: 1, name: 'Premium Wireless Headphones', sold: 145, revenue: 43500 },
    { id: 2, name: 'Smart Watch Pro', sold: 98, revenue: 29400 },
    { id: 3, name: 'Bluetooth Speaker', sold: 87, revenue: 17400 },
    { id: 4, name: 'Laptop Stand', sold: 76, revenue: 11400 },
    { id: 5, name: 'USB-C Hub', sold: 65, revenue: 9750 },
  ];

  const handleExport = () => {
    alert(`Exporting ${reportType} report from ${dateRange.startDate} to ${dateRange.endDate}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">View detailed insights about your business</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="sales">Sales Report</option>
              <option value="products">Product Performance</option>
              <option value="customers">Customer Analytics</option>
              <option value="inventory">Inventory Status</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter size={18} />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">৳{stats.totalSales.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp size={14} className="mr-1" />
                +12.5% from last period
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp size={14} className="mr-1" />
                +8.2% from last period
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">৳{stats.averageOrderValue}</p>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <TrendingUp size={14} className="mr-1" />
                -2.1% from last period
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp size={14} className="mr-1" />
                +15.3% from last period
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Users size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales Trend</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {salesData.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-primary-600 rounded-t-lg transition-all hover:bg-primary-700"
                style={{ height: `${(day.sales / 6100) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-500">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Units Sold</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Performance</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{product.sold} units</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-900">৳{product.revenue.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${((5 - index) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
