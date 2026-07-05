import React, { useState } from 'react';
import { Server, Users, Activity, CheckCircle2, XCircle, Loader, Save } from 'lucide-react';
import { useConfirm } from '../../contexts/ConfirmContext';
import type { AppConfig } from '../../types';

interface DirectoryAccessPanelProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
  onSaveDirectorySettings: () => void;
}

const DirectoryAccessPanel: React.FC<DirectoryAccessPanelProps> = ({ config, onConfigChange, onSaveDirectorySettings }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { confirm } = useConfirm();

  const handleSaveSettings = async () => {
    if (testResult?.success) {
      const noAdmins = testResult.adminGroup?.count === 0;
      const noViews = testResult.viewGroup?.count === 0;

      if (noAdmins || noViews) {
        const groupNames = [];
        if (noAdmins) groupNames.push('Admin Group');
        if (noViews) groupNames.push('View Group');
        
        const message = `Warning: No users were found in the following mapped group(s): ${groupNames.join(' and ')}. Are you sure you want to save this configuration?`;
        
        if (!(await confirm({ title: 'Empty Group Warning', message, confirmText: 'Save Anyway' }))) {
          return;
        }
      }
    }
    
    onSaveDirectorySettings();
    setTestResult(null); // Hide the success block
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/auth/test-ldap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      setTestResult({ success: false, error: 'Network communication error.' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-300">
      <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center">
        <Server size={20} className="mr-2 text-indigo-500" /> Directory Access (LDAP)
      </h4>

      <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div>
                <h5 className="text-sm font-bold text-gray-800 dark:text-gray-200">LDAP Configuration</h5>
                <a href="/guide#centralized-directory-access-ldap" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center mt-1">
                  View LDAP Setup Guide ↗
                </a>
              </div>
              <button
                onClick={handleTestConnection}
                disabled={isTesting || !config.ldapServerUrl || !config.ldapBaseDn}
                className="w-full sm:w-auto bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {isTesting ? <Loader size={16} className="animate-spin mr-2" /> : <Activity size={16} className="mr-2" />}
                {isTesting ? 'Testing Connection...' : 'Test Connection & Groups'}
              </button>
            </div>

            {testResult && (
              <div className={`mt-4 p-4 rounded-lg border ${testResult.success ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                <div className="flex items-center gap-2 font-bold mb-3">
                  {testResult.success ? <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" /> : <XCircle size={18} className="text-red-600 dark:text-red-400" />}
                  <span className={testResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
                    {testResult.success ? 'Bind Successful!' : `Error: ${testResult.error}`}
                  </span>
                </div>
                
                {testResult.success && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Admin Group Users ({testResult.adminGroup?.count || 0})</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {testResult.adminGroup?.sample?.length > 0 ? (
                          testResult.adminGroup.sample.map((user: string) => (
                            <span key={user} className="px-2 py-0.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-xs font-mono">{user}</span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">No users found.</span>
                        )}
                        {testResult.adminGroup?.count > 25 && <span className="px-2 py-0.5 text-xs text-gray-500">...and {testResult.adminGroup.count - 25} more</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">View Group Users ({testResult.viewGroup?.count || 0})</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {testResult.viewGroup?.sample?.length > 0 ? (
                          testResult.viewGroup.sample.map((user: string) => (
                            <span key={user} className="px-2 py-0.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-xs font-mono">{user}</span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">No users found.</span>
                        )}
                        {testResult.viewGroup?.count > 25 && <span className="px-2 py-0.5 text-xs text-gray-500">...and {testResult.viewGroup.count - 25} more</span>}
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-gray-500 italic mt-3">* User preview is limited to the first 25 users per group.</p>

                    <div className="mt-6 flex justify-end border-t border-green-200 dark:border-green-800 pt-4">
                      <button
                        onClick={handleSaveSettings}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Save size={16} className="mr-2" />
                        Save & Apply Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">Server Configuration</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Server URL</label>
                <input 
                  type="text"
                  value={config.ldapServerUrl || ''}
                  onChange={(e) => onConfigChange('ldapServerUrl', e.target.value)}
                  className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors"
                  placeholder="ldaps://ldap.example.com:636"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Base DN</label>
                <input 
                  type="text"
                  value={config.ldapBaseDn || ''}
                  onChange={(e) => onConfigChange('ldapBaseDn', e.target.value)}
                  className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors"
                  placeholder="dc=example,dc=com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2 flex items-center">
              <Users size={16} className="mr-1.5" /> Group Mapping
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Admin Group (cn)</label>
                <input 
                  type="text"
                  value={config.ldapAdminGroup || ''}
                  onChange={(e) => onConfigChange('ldapAdminGroup', e.target.value)}
                  className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors"
                  placeholder="e.g. calendar-admins"
                />
                <p className="text-[10px] text-gray-500 mt-1">Users in this group get full edit access.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">View Group (cn)</label>
                <input 
                  type="text"
                  value={config.ldapViewGroup || ''}
                  onChange={(e) => onConfigChange('ldapViewGroup', e.target.value)}
                  className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors"
                  placeholder="e.g. calendar-viewers"
                />
                <p className="text-[10px] text-gray-500 mt-1">Users in this group get read-only access.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">
              Security Notice: Sensitive bind credentials (LDAP_BIND_DN and LDAP_BIND_PASSWORD) must be configured in your docker-compose environment variables. They are not exposed in this UI.
            </p>
          </div>
        </div>
      </div>
    );
};

export default DirectoryAccessPanel;