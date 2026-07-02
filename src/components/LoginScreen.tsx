import React, { useState } from 'react';
import { Lock, Loader, LogIn, CalendarDays } from 'lucide-react';
import type { Role, AppConfig } from '../types';
import { ICON_MAP } from '../utils/constants';

interface LoginScreenProps {
  config: AppConfig;
  onAuthenticate: (role: Role) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ config, onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const HeaderIcon = ICON_MAP[config.headerIcon || 'CalendarDays'] || CalendarDays;
  const title = config.ownerName ? `${config.ownerName}'s Calendar` : 'Private Calendar';
  const loginMessage = config.loginMessage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const { role } = await response.json();
        onAuthenticate(role);
      } else if (response.status === 401) {
        setLocalError('Incorrect password or expired access.');
      } else {
        setLocalError(`Server error (${response.status}).`);
      }
    } catch (err) {
      setLocalError('Connection error. Could not reach the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-200 dark:border-gray-700">
          <HeaderIcon size={40} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{title}</h1>
        {loginMessage && (
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">{loginMessage}</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 border dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLocalError(null);
                }}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors ${localError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}`}
                placeholder="Enter password..."
                disabled={isLoading}
                autoFocus
              />
            </div>
            {localError && <p className="text-red-500 text-sm mt-2 font-bold">{localError}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader size={20} className="animate-spin" /> : <LogIn size={20} />}
            <span className="ml-2">{isLoading ? 'Verifying...' : 'Login'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;