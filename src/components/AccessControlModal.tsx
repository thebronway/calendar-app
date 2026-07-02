import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Globe, ShieldCheck, Key as KeyIcon, Plus, Trash2, Clock, CheckCircle2, XCircle 
} from 'lucide-react';
import { useConfirm } from '../contexts/ConfirmContext';
import { usePreventTabClose } from '../hooks/useUnsavedChanges';
import type { AppConfig } from '../types';

interface AccessProfile {
  id: string;
  name: string;
  expiresAt: string | null;
  createdAt: string;
}

interface AuditLog {
  timestamp: string;
  ip: string;
  status: 'success' | 'failed';
  role: string;
  accountName: string;
}

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
  const [newAccessName, setNewAccessName] = useState('');
  const [newAccessPass, setNewAccessPass] = useState('');
  const [newAccessExpiry, setNewAccessExpiry] = useState('');
  const [isCreatingAccess, setIsCreatingAccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
      setNameError(null);
      setPasswordError(null);
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

  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccessName || !newAccessPass) return;
    setIsCreatingAccess(true);
    setNameError(null);
    setPasswordError(null);
    
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAccessName,
          password: newAccessPass,
          expiresAt: newAccessExpiry ? new Date(newAccessExpiry).toISOString() : null
        })
      });
      if (res.ok) {
        const newAccess = await res.json();
        setAccessList(prev => [...prev, newAccess]);
        setNewAccessName('');
        setNewAccessPass('');
        setNewAccessExpiry('');
      } else if (res.status === 409) {
        const errorData = await res.json();
        if (errorData.error === 'name_exists') {
          setNameError('This name is already in use.');
        } else {
          setPasswordError('This password is already in use by another profile.');
        }
      } else {
        setPasswordError('Failed to create password.');
      }
    } catch (e) {
      console.error('Failed to create access', e);
      setPasswordError('Connection error.');
    } finally {
      setIsCreatingAccess(false);
    }
  };

  const handleRevokeAccess = async (id: string) => {
    if (!(await confirm({ 
      title: 'Revoke Access', 
      message: 'Are you sure you want to revoke this password? Anyone using it will lose access immediately.', 
      confirmText: 'Revoke' 
    }))) return;
    
    try {
      const res = await fetch(`/api/access/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAccessList(prev => prev.filter(a => a.id !== id));
      }
    } catch (e) {
      console.error('Failed to revoke access', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <ShieldCheck size={24} className="mr-3 text-emerald-500" /> Access & Security
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900/50">
          <div className="space-y-8 max-w-2xl mx-auto">
            
            {/* Global Visibility */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
              <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center">
                <Globe size={20} className="mr-2 text-blue-500" /> Global Visibility
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                <div>
                  <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">Calendar View Mode</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                    {localConfig.viewMode === 'private'
                      ? 'Private: Unauthenticated visitors are blocked by a full-screen login prompt.'
                      : 'Public: Anyone with the URL can view the calendar dashboard (read-only).'}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 bg-white dark:bg-gray-800 p-1.5 rounded-lg border dark:border-gray-600">
                  <button
                    onClick={handleTogglePublic}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${localConfig.viewMode !== 'private' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                  >
                    Public
                  </button>
                  <button
                    onClick={handleTogglePrivate}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${localConfig.viewMode === 'private' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                  >
                    Private
                  </button>
                </div>
              </div>

              {localConfig.viewMode === 'private' && (
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Custom Login Message</label>
                  <input 
                    type="text"
                    value={localConfig.loginMessage || ''}
                    onChange={(e) => handleConfigChange('loginMessage', e.target.value)}
                    onBlur={() => onConfigSave(localConfig)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white transition-colors"
                    placeholder="e.g. Welcome to my calendar, please log in."
                  />
                  <p className="text-xs text-gray-500 mt-1.5 font-medium">If left blank, no message will be shown on the login screen.</p>
                </div>
              )}
            </div>

            {/* View Passwords */}
            {localConfig.viewMode === 'private' && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center">
                  <KeyIcon size={20} className="mr-2 text-purple-500" /> View Passwords
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Create secondary passwords that grant read-only access to the calendar.</p>

                <div className="space-y-3 mb-6">
                  {accessList.length === 0 ? (
                    <div className="text-sm text-gray-500 italic p-4 text-center border border-dashed dark:border-gray-700 rounded-lg">
                      No view passwords created yet.
                    </div>
                  ) : accessList.map(access => {
                    const isExpired = access.expiresAt && new Date(access.expiresAt) < new Date();
                    return (
                      <div key={access.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                        <div>
                          <span className="block font-bold text-gray-800 dark:text-gray-200 text-sm sm:text-base">{access.name}</span>
                          <span className={`block text-xs mt-1 font-medium ${isExpired ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            {access.expiresAt ? `Expires: ${new Date(access.expiresAt).toLocaleDateString()}` : 'Never expires'}
                            {isExpired && ' (Expired)'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRevokeAccess(access.id)}
                          className="flex items-center justify-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 size={16} /> Revoke
                        </button>
                      </div>
                    )
                  })}
                </div>

                <form onSubmit={handleCreateAccess} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                  <h5 className="font-bold text-sm text-gray-800 dark:text-gray-200">Create New Password</h5>
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Name / Label</label>
                      <input 
                        type="text" 
                        required 
                        value={newAccessName} 
                        onChange={e => {
                          setNewAccessName(e.target.value);
                          setNameError(null);
                        }} 
                        className={`w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:text-white transition-colors ${nameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`} 
                      />
                      {nameError && <p className="text-red-500 text-xs mt-1 font-bold">{nameError}</p>}
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
                      <input 
                        type="text" 
                        required 
                        value={newAccessPass} 
                        onChange={e => {
                          setNewAccessPass(e.target.value);
                          setPasswordError(null);
                        }} 
                        className={`w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:text-white transition-colors ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`} 
                      />
                      {passwordError && <p className="text-red-500 text-xs mt-1 font-bold">{passwordError}</p>}
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Expires On</label>
                      <input 
                        type="date" 
                        value={newAccessExpiry} 
                        onChange={e => setNewAccessExpiry(e.target.value)} 
                        className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Note: If no date is selected, access is unlimited.</p>
                    </div>
                    <div className="w-full md:w-auto md:pt-[20px] shrink-0">
                      <button 
                        type="submit" 
                        disabled={isCreatingAccess || !newAccessName || !newAccessPass} 
                        className="w-full md:w-auto h-[38px] bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <Plus size={16} className="mr-1.5" /> Add Password
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Audit Logs */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
              <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center">
                <Clock size={20} className="mr-2 text-orange-500" /> Recent Activity
              </h4>
              <div className="overflow-x-auto border dark:border-gray-700 rounded-lg">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase font-bold text-xs">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">Timestamp</th>
                      <th className="px-4 py-3">IP Address</th>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {logs.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-4 text-center italic">No recent activity.</td></tr>
                    ) : logs.map((log, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{log.ip}</td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{log.accountName}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {log.status === 'success' ? (
                            <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs">
                              <CheckCircle2 size={12} /> Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-400 font-bold bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-xs">
                              <XCircle size={12} /> Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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