import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package,
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
  const [reportData, setReportData] = useState(null);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // In production, replace with actual API call
      // const response = await fetch(`/api/reports/${reportType}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      // const data = await response.json();
      
      // Mock data for demonstration
      setTimeout(() => {
        setReportData({
          totalSales: 125000,
          totalOrders: 342,
          averageOrderValue: 365,
          growth: 12.5,
          dailyData: [
            { date: '2024-08-01', sales: 3200, orders: 12 },
            { date: '2024-08-02', sales: 4100, orders: 15 },
            { date: '2024-08-03', sales: 2800, orders: 9 },
            { date: '2024-08-04', sales: 5200, orders: 18 },
            { date: '2024-08-05', sales: 4800, orders: 16 },
            { date: '2024-08-06', sales: 3900, orders: 13 },
            { date: '2024-08-07', sales: 4500, orders: 14 },
          ]
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching report:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const handleExport = () => {
    alert('Export functionality will download CSV/PDF report');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">View detailed insights about your business</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="sales">Sales Report</option>
              <option value="products">Product Performance</option>
              <option value="customers">Customer Report</option>
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReportData}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
            >
              <Filter size={18} />
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ৳{reportData.totalSales.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign size={24} className="text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp size={16} className="text-green-600 mr-1" />
                <span className="text-green-600 font-medium">{reportData.growth}%</span>
                <span className="text-gray-600 ml-1">vs last period</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ShoppingCart size={24} className="text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp size={16} className="text-green-600 mr-1" />
                <span className="text-green-600 font-medium">8.2%</span>
                <span className="text-gray-600 ml-1">vs last period</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ৳{reportData.averageOrderValue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <BarChart size={24} className="text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingDown size={16} className="text-red-600 mr-1" />
                <span className="text-red-600 font-medium">2.1%</span>
                <span className="text-gray-600 ml-1">vs last period</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users size={24} className="text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp size={16} className="text-green-600 mr-1" />
                <span className="text-green-600 font-medium">15.3%</span>
                <span className="text-gray-600 ml-1">vs last period</span>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sales Trend</h2>
              <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2">
              {reportData.dailyData.map((day, index) => {
                const maxSales = Math.max(...reportData.dailyData.map(d => d.sales));
                const height = (day.sales / maxSales) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary-600 rounded-t transition-all duration-300 hover:bg-primary-700"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { id: '#ORD-001', customer: 'John Doe', date: '2024-08-17', amount: 1250, status: 'completed' },
                    { id: '#ORD-002', customer: 'Jane Smith', date: '2024-08-17', amount: 890, status: 'processing' },
                    { id: '#ORD-003', customer: 'Mike Johnson', date: '2024-08-16', amount: 2340, status: 'completed' },
                    { id: '#ORD-004', customer: 'Sarah Wilson', date: '2024-08-16', amount: 560, status: 'pending' },
                    { id: '#ORD-005', customer: 'David Brown', date: '2024-08-15', amount: 1890, status: 'completed' },
                  ].map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ৳{order.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  );
};

export default Reports;
