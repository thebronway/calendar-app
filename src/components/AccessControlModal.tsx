import React, { useState, useEffect, useCallback } from 'react';
import { X, ShieldCheck, Key, Clock } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'access' | 'logs'>('access');
  
  // Access & Logs State
  const [accessList, setAccessList] = useState<AccessProfile[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  // Security Verification State
  const [pendingConfigChange, setPendingConfigChange] = useState<Partial<AppConfig> | null>(null);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

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

  const handleTogglePublic = () => {
    if (localConfig.viewMode === 'public') return;
    setPendingConfigChange({ viewMode: 'public' });
  };

  const handleTogglePrivate = () => {
    if (localConfig.viewMode === 'private') return;
    setPendingConfigChange({ viewMode: 'private' });
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: verifyPassword })
      });
      
      if (res.ok) {
        // Verification succeeded, execute the queued change
        if (pendingConfigChange) {
          const newConfig = { ...localConfig, ...pendingConfigChange };
          setLocalConfig(newConfig);
          onConfigSave(newConfig);
        }
        setPendingConfigChange(null);
        setVerifyPassword('');
      } else {
        setVerifyError('Incorrect admin password.');
      }
    } catch (err) {
      setVerifyError('Connection error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
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

        <div className="flex overflow-x-auto border-b dark:border-gray-700 bg-white dark:bg-gray-800 px-6 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setActiveTab('access')}
            className={`flex items-center py-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'access' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            <Key size={18} className="mr-2" />
            Access Rules
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center py-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'logs' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            <Clock size={18} className="mr-2" />
            Audit Logs
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900/50">
          <div className="space-y-8">
            {activeTab === 'access' && (
              <>
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
              </>
            )}
            
            {activeTab === 'logs' && (
              <AuditLogsPanel logs={logs} />
            )}
          </div>
        </div>

        <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end shrink-0 rounded-b-xl">
          <button onClick={handleClose} className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold transition-colors shadow-sm">
            Close
          </button>
        </div>

        {/* Security Verification Overlay */}
        {pendingConfigChange && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-10 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
              <button 
                onClick={() => { setPendingConfigChange(null); setVerifyPassword(''); setVerifyError(null); }} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Verify Changes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {pendingConfigChange.viewMode === 'public' 
                  ? 'Switching to Public Mode makes the calendar visible to everyone. Your existing user passwords will be saved in the database but will remain dormant.'
                  : 'Please enter your admin password to confirm these security changes.'}
              </p>
              <form onSubmit={handleVerifyPassword} className="space-y-4">
                <div>
                  <input
                    type="password"
                    autoFocus
                    value={verifyPassword}
                    onChange={(e) => { setVerifyPassword(e.target.value); setVerifyError(null); }}
                    className={`w-full p-3 text-sm border rounded-lg dark:bg-gray-900 dark:text-white transition-colors ${verifyError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="Master Admin Password"
                    disabled={isVerifying}
                  />
                  {verifyError && <p className="text-red-500 text-xs mt-1.5 font-bold">{verifyError}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isVerifying || !verifyPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Confirm & Apply'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessControlModal;