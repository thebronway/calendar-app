import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export interface AuditLog {
  timestamp: string;
  ip: string;
  status: 'success' | 'failed';
  role: string;
  accountName: string;
}

interface AuditLogsPanelProps {
  logs: AuditLog[];
}

const AuditLogsPanel: React.FC<AuditLogsPanelProps> = ({ logs }) => {
  return (
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
  );
};

export default AuditLogsPanel;