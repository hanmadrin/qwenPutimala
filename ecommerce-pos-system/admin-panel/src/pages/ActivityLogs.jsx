import React, { useState } from 'react';
import {
  Activity,
  User,
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  TrendingUp
} from 'lucide-react';

const ActivityLogs = () => {
  const [filters, setFilters] = useState({
    search: '',
    entityType: '',
    action: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const [logs] = useState([
    {
      id: 1,
      user: { name: 'Admin User', email: 'admin@example.com', role: 'superadmin' },
      action: 'CREATE',
      entityType: 'product',
      entityId: 101,
      details: { name: 'New Product Added' },
      timestamp: '2024-08-17 10:30:00'
    },
    {
      id: 2,
      user: { name: 'Branch Manager', email: 'manager@example.com', role: 'branch_manager' },
      action: 'UPDATE',
      entityType: 'order',
      entityId: 542,
      details: { status: 'processing → shipped' },
      timestamp: '2024-08-17 09:15:00'
    },
    {
      id: 3,
      user: { name: 'Cashier', email: 'cashier@example.com', role: 'cashier' },
      action: 'CREATE',
      entityType: 'order',
      entityId: 543,
      details: { type: 'walk-in', amount: 2500 },
      timestamp: '2024-08-17 08:45:00'
    },
    {
      id: 4,
      user: { name: 'Admin User', email: 'admin@example.com', role: 'superadmin' },
      action: 'DELETE',
      entityType: 'customer',
      entityId: 89,
      details: { reason: 'Duplicate entry' },
      timestamp: '2024-08-16 16:20:00'
    },
    {
      id: 5,
      user: { name: 'System', email: 'system@ecompos.local', role: 'system' },
      action: 'BACKUP',
      entityType: 'database',
      entityId: null,
      details: { size: '12.5 MB', location: 'Google Drive' },
      timestamp: '2024-08-16 03:00:00'
    },
    {
      id: 6,
      user: { name: 'Branch Manager', email: 'manager@example.com', role: 'branch_manager' },
      action: 'UPDATE',
      entityType: 'inventory',
      entityId: 234,
      details: { product: 'Wireless Headphones', change: '-5 units' },
      timestamp: '2024-08-15 14:30:00'
    },
  ]);

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      case 'BACKUP': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case 'product': return '📦';
      case 'order': return '🛒';
      case 'customer': return '👤';
      case 'inventory': return '📊';
      case 'database': return '💾';
      default: return '📄';
    }
  };

  const handleExport = () => {
    alert('Exporting activity logs to CSV...');
  };

  const handleClearOld = () => {
    if (window.confirm('Are you sure you want to clear logs older than 90 days?')) {
      alert('Old logs cleared successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-500 mt-1">Track all system activities and changes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClearOld}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Trash2 size={18} />
            Clear Old Logs
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download size={18} />
            Export Logs
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Activity size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Activities</p>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter(l => l.timestamp.startsWith('2024-08-17')).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(logs.map(l => l.user.email)).size}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <User size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Most Active Entity</p>
              <p className="text-lg font-bold text-gray-900 capitalize">
                {logs.reduce((acc, log) => {
                  acc[log.entityType] = (acc[log.entityType] || 0) + 1;
                  return acc;
                }, {}) && Object.entries(logs.reduce((acc, log) => {
                  acc[log.entityType] = (acc[log.entityType] || 0) + 1;
                  return acc;
                }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <FileText size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by user, action, or entity..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity Type
            </label>
            <select
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="product">Product</option>
              <option value="order">Order</option>
              <option value="customer">Customer</option>
              <option value="inventory">Inventory</option>
              <option value="database">Database</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="BACKUP">Backup</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter size={18} />
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Timestamp</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Entity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.user.name}</p>
                      <p className="text-xs text-gray-500">{log.user.role}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getEntityIcon(log.entityType)}</span>
                      <span className="text-sm text-gray-600 capitalize">{log.entityType}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {Object.entries(log.details).map(([key, value]) => (
                        <span key={key} className="block">
                          {key}: {value}
                        </span>
                      ))}
                    </span>
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

export default ActivityLogs;
