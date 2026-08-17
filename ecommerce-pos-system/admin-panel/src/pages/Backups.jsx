import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Download, 
  Upload, 
  Trash2, 
  Database, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Calendar
} from 'lucide-react';

const Backups = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');

  const fetchBackups = async () => {
    setLoading(true);
    try {
      // In production, replace with actual API call
      // const response = await fetch('/api/backups');
      // const data = await response.json();
      
      // Mock data for demonstration
      setTimeout(() => {
        setBackups([
          {
            id: 1,
            filename: 'ecommerce_backup_2024-08-17_03-00-00.json',
            sizeMb: 12.5,
            createdAt: '2024-08-17T03:00:00Z',
            createdBy: 'Admin User',
            driveFileId: '1a2b3c4d5e6f',
            status: 'completed'
          },
          {
            id: 2,
            filename: 'ecommerce_backup_2024-08-16_03-00-00.json',
            sizeMb: 11.8,
            createdAt: '2024-08-16T03:00:00Z',
            createdBy: 'Admin User',
            driveFileId: '7g8h9i0j1k2l',
            status: 'completed'
          },
          {
            id: 3,
            filename: 'ecommerce_backup_2024-08-15_03-00-00.json',
            sizeMb: 11.2,
            createdAt: '2024-08-15T03:00:00Z',
            createdBy: 'System',
            driveFileId: '3m4n5o6p7q8r',
            status: 'completed'
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching backups:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      // In production, replace with actual API call
      // const response = await fetch('/api/backups', { method: 'POST' });
      // const data = await response.json();
      
      setTimeout(() => {
        alert('Backup created successfully! Size: 12.8 MB');
        setCreatingBackup(false);
        fetchBackups();
      }, 2000);
    } catch (error) {
      console.error('Error creating backup:', error);
      setCreatingBackup(false);
    }
  };

  const handleDeleteBackup = async (id) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      // In production, replace with actual API call
      // const response = await fetch(`/api/backups/${id}`, { method: 'DELETE' });
      
      alert('Backup deleted successfully');
      fetchBackups();
    } catch (error) {
      console.error('Error deleting backup:', error);
    }
  };

  const handleDownloadBackup = async (backup) => {
    try {
      // In production, replace with actual API call
      // const response = await fetch(`/api/backups/${backup.id}/download`);
      // const blob = await response.blob();
      
      alert(`Downloading ${backup.filename}...`);
    } catch (error) {
      console.error('Error downloading backup:', error);
    }
  };

  const handleRestoreBackup = async (backup) => {
    if (!confirm('WARNING: Restoring a backup will overwrite current data. Continue?')) {
      return;
    }

    try {
      // In production, replace with actual API call
      // const response = await fetch(`/api/backups/${backup.id}/restore`, { method: 'POST' });
      
      alert('Backup restore initiated. This process may take several minutes.');
    } catch (error) {
      console.error('Error restoring backup:', error);
    }
  };

  const handleScheduleBackup = async () => {
    try {
      // In production, replace with actual API call
      // const response = await fetch('/api/backups/schedule', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ frequency: scheduleFrequency })
      // });
      
      alert(`Backup scheduled to run ${scheduleFrequency}`);
      setScheduleModalOpen(false);
    } catch (error) {
      console.error('Error scheduling backup:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'failed':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'processing':
        return <Clock size={20} className="text-yellow-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-gray-600 mt-1">Manage database backups and restoration</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setScheduleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Calendar size={18} />
            Schedule
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={creatingBackup}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {creatingBackup ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            Create Backup
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Backups</p>
              <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Database size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {backups.reduce((sum, b) => sum + b.sizeMb, 0).toFixed(1)} MB
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Cloud size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Backup</p>
              <p className="text-lg font-bold text-gray-900">
                {backups[0] ? new Date(backups[0].createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Backup Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Cloud size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Google Drive Backup</h3>
            <p className="text-sm text-blue-700 mt-1">
              All backups are automatically stored in Google Drive for secure cloud storage.
              Make sure to configure your Google Drive API credentials in the environment variables.
            </p>
          </div>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Backup History</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12">
            <Database size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No backups found</p>
            <button
              onClick={handleCreateBackup}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your first backup
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusIcon(backup.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {backup.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {backup.sizeMb.toFixed(2)} MB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(backup.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {backup.createdBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadBackup(backup)}
                          className="text-primary-600 hover:text-primary-700"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleRestoreBackup(backup)}
                          className="text-green-600 hover:text-green-700"
                          title="Restore"
                        >
                          <Upload size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule Automatic Backup</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Frequency
              </label>
              <select
                value={scheduleFrequency}
                onChange={(e) => setScheduleFrequency(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleBackup}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backups;
