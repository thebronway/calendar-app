import React, { useState, useEffect } from 'react';
import { Database, Download, RotateCcw, AlertTriangle, Loader, HardDriveUpload } from 'lucide-react';
import { useConfirm } from '../../contexts/ConfirmContext';
import type { AppConfig } from '../../types';

interface Backup {
  id: string;
  name: string;
  timestamp: string;
  type: 'auto' | 'snapshot' | 'manual';
}

interface DataManagementSettingsProps {
  config: AppConfig;
}

const DataManagementSettings: React.FC<DataManagementSettingsProps> = ({ config }) => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/backups');
      if (res.ok) setBackups(await res.json());
    } catch (err) {
      console.error('Failed to fetch backups', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualBackup = async () => {
    setIsCreatingManual(true);
    try {
      const res = await fetch('/api/backups/manual', { method: 'POST' });
      if (res.ok) {
        await fetchBackups();
      } else {
        alert('Failed to create manual backup.');
      }
    } catch (err) {
      console.error('Failed to create manual backup', err);
      alert('Failed to create manual backup.');
    } finally {
      setIsCreatingManual(false);
    }
  };

  const handleRestore = async (backup: Backup) => {
    if (!(await confirm({
      title: 'Restore Data',
      message: `Are you sure you want to restore from "${backup.name}"? This will overwrite your current calendar data. A safety snapshot will be taken first.`,
      confirmText: 'Yes, Restore',
    }))) return;

    setIsRestoring(true);
    try {
      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupName: backup.name }),
      });
      if (!res.ok) throw new Error('Restore failed');
      // The websocket FORCE_RELOAD event will trigger an instant page refresh here.
    } catch (err) {
      console.error(err);
      setIsRestoring(false);
      alert('Failed to restore backup.');
    }
  };

  return (
    <div className="bg-theme-panel p-6 rounded-xl shadow-sm border border-theme-item relative">
      {isRestoring && (
        <div className="absolute inset-0 z-10 bg-theme-panel/60 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
          <Loader size={40} className="animate-spin text-theme-accent mb-4" />
          <p className="text-lg font-bold text-theme-text">Restoring Data...</p>
        </div>
      )}

      <h4 className="text-lg font-bold mb-4 text-theme-text flex items-center">
        <Database size={20} className="mr-2 text-theme-accent" /> Backup & Restore
      </h4>

      <div className="mb-8 space-y-3">
        <div className="p-4 bg-theme-item rounded-lg border border-theme-item flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="block text-sm font-bold text-theme-text">Export Calendar Data</span>
            <span className="block text-xs text-theme-text-secondary mt-1">Download all of your data (raw .json configuration and calendar files) as a zip archive.</span>
          </div>
          <a
            href="/api/backups/download"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-theme-accent text-theme-accent-text px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-colors flex items-center shadow-sm whitespace-nowrap shrink-0"
          >
            <Download size={16} className="mr-2" /> Download .zip
          </a>
        </div>
        
        <div className="p-4 bg-theme-item rounded-lg border border-theme-item flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="block text-sm font-bold text-theme-text">Manual Local Backup</span>
            <span className="block text-xs text-theme-text-secondary mt-1">Create a manual backup of your data (raw .json configuration and calendar files) in its current state.</span>
          </div>
          <button
            onClick={handleManualBackup}
            disabled={isCreatingManual}
            className="bg-theme-panel text-theme-text border border-theme-item px-4 py-2 rounded-lg text-sm font-bold hover:bg-theme-item-hover transition-colors flex items-center shadow-sm whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {isCreatingManual ? <Loader size={16} className="animate-spin mr-2" /> : <HardDriveUpload size={16} className="mr-2" />}
            Create Backup Now
          </button>
        </div>
      </div>

      <div>
        <div className="flex flex-col mb-3">
          <div className="flex items-center justify-between mb-1">
            <h5 className="text-sm font-bold text-theme-text">Local Backups</h5>
            <span className="text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded flex items-center shrink-0">
              <AlertTriangle size={12} className="mr-1" /> Auto-deletes after 7 days
            </span>
          </div>
          <span className="text-xs font-medium text-theme-text-secondary">
            Automated backups run nightly at midnight ({config.timezone}).
          </span>
        </div>

        <div className="overflow-x-auto border border-theme-grid-divider rounded-lg">
          <table className="w-full text-left text-sm text-theme-text-secondary">
            <thead className="bg-theme-grid-header text-theme-text-secondary uppercase font-bold text-xs border-b border-theme-grid-divider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-grid-divider">
              {isLoading ? (
                <tr><td colSpan={3} className="px-4 py-6 text-center"><Loader size={20} className="animate-spin mx-auto text-theme-text-secondary" /></td></tr>
              ) : backups.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-4 text-center italic">No backups found.</td></tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-theme-item-hover transition-colors">
                    <td className="px-4 py-3 font-medium text-theme-text">{new Date(backup.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {backup.type === 'snapshot' && (
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-bold">Safety Snapshot</span>
                      )}
                      {backup.type === 'manual' && (
                        <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 px-2 py-0.5 rounded text-xs font-bold">Manual Backup</span>
                      )}
                      {backup.type === 'auto' && (
                        <span className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-bold">Nightly Backup</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRestore(backup)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded transition-colors"
                        title="Restore this backup"
                      >
                        <RotateCcw size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataManagementSettings;