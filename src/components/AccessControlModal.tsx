import React, { useState, useEffect, useCallback } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useConfirm } from '../contexts/ConfirmContext';
import { usePreventTabClose } from '../hooks/useUnsavedChanges';
import GlobalVisibilityPanel from './access/GlobalVisibilityPanel';
import ViewPasswordsPanel, { AccessProfile } from './access/ViewPasswordsPanel';
import AuditLogsPanel, { AuditLog } from './access/AuditLogsPanel';
import type { AppConfig } from '../types';

interface AccessControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onConfigSave: (config: AppConfig) => void;
}

const AccessControlModal: React.FC<AccessControlModalProps> = ({ isOpen, onClose, config, onConfigSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  
  // Access & Logs State
  const [accessList, setAccessList] = useState<AccessProfile[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const fetchAccessAndLogs = useCallback(async () => {
    try {
      const [accessRes, logsRes] = await Promise.all([
        fetch('/api/access'),
        fetch('/api/auth/logs')
      ]);
      if (accessRes.ok) setAccessList(await accessRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (e) {
      console.error('Failed to fetch access and logs', e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      fetchAccessAndLogs();
    }
  }, [isOpen, config, fetchAccessAndLogs]);

  const isDirty = JSON.stringify(localConfig) !== JSON.stringify(config);
  const { confirm } = useConfirm();
  usePreventTabClose(isDirty);

  const handleClose = async () => {
    if (isDirty && !(await confirm())) return;
    onClose();
  };

  const handleConfigChange = <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleTogglePublic = async () => {
    if (localConfig.viewMode === 'public') return;
    
    if (accessList.length > 0) {
      if (!(await confirm({ 
        title: 'Switch to Public Mode', 
        message: 'Switching to Public mode will delete all existing view passwords. Are you sure?', 
        confirmText: 'Yes, Delete Passwords' 
      }))) return;
      
      for (const access of accessList) {
        await fetch(`/api/access/${access.id}`, { method: 'DELETE' });
      }
      setAccessList([]);
    }
    const newConfig = { ...localConfig, viewMode: 'public' as const };
    setLocalConfig(newConfig);
    onConfigSave(newConfig);
  };

  const handleTogglePrivate = () => {
    if (localConfig.viewMode === 'private') return;
    const newConfig = { ...localConfig, viewMode: 'private' as const };
    setLocalConfig(newConfig);
    onConfigSave(newConfig);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <ShieldCheck size={24} className="mr-3 text-emerald-500" /> Access & Security
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900/50">
          <div className="space-y-8">
            <GlobalVisibilityPanel
              config={localConfig}
              onConfigChange={handleConfigChange}
              onConfigSave={onConfigSave}
              onTogglePublic={handleTogglePublic}
              onTogglePrivate={handleTogglePrivate}
            />

            {localConfig.viewMode === 'private' && (
              <ViewPasswordsPanel
                accessList={accessList}
                onAccessAdded={(access) => setAccessList(prev => [...prev, access])}
                onAccessRevoked={(id) => setAccessList(prev => prev.filter(a => a.id !== id))}
              />
            )}

            <AuditLogsPanel logs={logs} />
          </div>
        </div>

        <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end shrink-0 rounded-b-xl">
          <button onClick={handleClose} className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold transition-colors shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessControlModal;