import React, { useState } from 'react';
import {
  Database,
  Cloud,
  Download,
  Upload,
  Trash2,
  Clock,
  HardDrive,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Backups = () => {
  const [backups, setBackups] = useState([
    {
      id: 1,
      filename: 'ecommerce_backup_2024-08-17_03-00-00.json',
      size: 12.5,
      createdAt: '2024-08-17 03:00:00',
      location: 'Google Drive',
      status: 'completed'
    },
    {
      id: 2,
      filename: 'ecommerce_backup_2024-08-16_03-00-00.json',
      size: 11.8,
      createdAt: '2024-08-16 03:00:00',
      location: 'Google Drive',
      status: 'completed'
    },
    {
      id: 3,
      filename: 'ecommerce_backup_2024-08-15_03-00-00.json',
      size: 11.2,
      createdAt: '2024-08-15 03:00:00',
      location: 'Local Only',
      status: 'completed'
    },
  ]);

  const [creatingBackup, setCreatingBackup] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [scheduleTime, setScheduleTime] = useState('03:00');

  const handleCreateBackup = () => {
    setCreatingBackup(true);
    setTimeout(() => {
      setCreatingBackup(false);
      alert('Backup created successfully!');
    }, 2000);
  };

  const handleDownload = (backup) => {
    alert(`Downloading ${backup.filename}...`);
  };

  const handleRestore = (backup) => {
    if (window.confirm(`Are you sure you want to restore from ${backup.filename}? This will overwrite current data.`)) {
      alert('Restoring from backup...');
    }
  };

  const handleDelete = (backup) => {
    if (window.confirm(`Are you sure you want to delete ${backup.filename}?`)) {
      setBackups(backups.filter(b => b.id !== backup.id));
      alert('Backup deleted successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-gray-500 mt-1">Manage database backups and recovery</p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={creatingBackup}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {creatingBackup ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Creating Backup...
            </>
          ) : (
            <>
              <Database size={18} />
              Create Backup Now
            </>
          )}
        </button>
      </div>

      {/* Backup Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Automatic Backup Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="text-primary-600" size={24} />
              <div>
                <p className="font-medium text-gray-900">Scheduled Backups</p>
                <p className="text-sm text-gray-500">Daily automatic backups</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Cloud className="text-primary-600" size={24} />
              <div>
                <p className="font-medium text-gray-900">Backup Time</p>
                <p className="text-sm text-gray-500">Daily schedule time</p>
              </div>
            </div>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              disabled={!scheduleEnabled}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-900">Backup Storage Information</p>
              <p className="text-sm text-blue-700 mt-1">
                Backups are stored in Google Drive and locally. Ensure your Google Drive API credentials are configured in the environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <HardDrive size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Backups</p>
              <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Cloud size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cloud Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {backups.filter(b => b.location === 'Google Drive').reduce((acc, b) => acc + b.size, 0).toFixed(1)} MB
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Database size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Backup</p>
              <p className="text-lg font-bold text-gray-900">
                {backups[0]?.createdAt.split(' ')[0]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Backup History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Filename</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Size</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Created At</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Location</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-900">{backup.filename}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{backup.size} MB</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{backup.createdAt}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      backup.location === 'Google Drive' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {backup.location}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle size={16} />
                      {backup.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(backup)}
                        className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleRestore(backup)}
                        className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                        title="Restore"
                      >
                        <Upload size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(backup)}
                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
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
        {backups.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Database size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No backups found. Create your first backup now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Backups;
