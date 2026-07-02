import React, { useState } from 'react';
import { Key as KeyIcon, Plus, Trash2 } from 'lucide-react';
import { useConfirm } from '../../contexts/ConfirmContext';

export interface AccessProfile {
  id: string;
  name: string;
  expiresAt: string | null;
  createdAt: string;
}

interface ViewPasswordsPanelProps {
  accessList: AccessProfile[];
  onAccessAdded: (access: AccessProfile) => void;
  onAccessRevoked: (id: string) => void;
}

const ViewPasswordsPanel: React.FC<ViewPasswordsPanelProps> = ({ accessList, onAccessAdded, onAccessRevoked }) => {
  const [newAccessName, setNewAccessName] = useState('');
  const [newAccessPass, setNewAccessPass] = useState('');
  const [newAccessExpiry, setNewAccessExpiry] = useState('');
  const [isCreatingAccess, setIsCreatingAccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { confirm } = useConfirm();

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
        onAccessAdded(newAccess);
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
        onAccessRevoked(id);
      }
    } catch (e) {
      console.error('Failed to revoke access', e);
    }
  };

  return (
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
  );
};

export default ViewPasswordsPanel;