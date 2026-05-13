import React, { useState, useEffect } from 'react';
import { X, Lock, Loader, LogIn } from 'lucide-react';
import type { Role } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (role: Role, token: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setLocalError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const { role, token } = await response.json();
        onAuthenticate(role, token);
        onClose();
      } else if (response.status === 401) {
        setLocalError('Incorrect password.');
      } else {
        setLocalError(`Server error (${response.status}). Please try again.`);
      }
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
        setLocalError('Request timed out. Is the server running?');
      } else {
        console.error('Auth error:', err);
        setLocalError('Connection error. Could not reach the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-[80] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <Lock size={24} className="mr-2 text-blue-500" /> Admin Access
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLocalError(null);
              }}
              className={`w-full border rounded-lg p-3 text-lg dark:bg-gray-700 dark:text-white transition-colors ${localError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder="Enter Password"
              disabled={isLoading}
              autoFocus
            />
            {localError && <p className="text-red-500 text-sm mt-2 font-bold">{localError}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors"
          >
            {isLoading ? <Loader size={20} className="animate-spin" /> : <LogIn size={20} />}
            <span className="ml-2">Authenticate</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
