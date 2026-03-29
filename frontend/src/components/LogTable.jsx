import React from 'react';

/**
 * Log Table Component - Displays network activity logs
 */
const LogTable = ({ logs, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No logs available</p>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    return status === 'allowed' 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Safe string conversion helper
  const safeString = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback;
    return String(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Timestamp
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Application
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Domain/IP
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Protocol
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
              Port
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Status
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
              Anomaly
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log, index) => (
            <tr 
              key={log._id || index}
              className={`hover:bg-gray-50 transition-colors ${log.isAnomaly ? 'bg-red-50' : ''}`}
            >
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                {formatTimestamp(log.timestamp)}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                {safeString(log.appName)}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                <div className="max-w-[200px] lg:max-w-none">
                  {log.domain && log.domain !== '' ? (
                    <div className="font-medium truncate" title={log.domain}>{log.domain}</div>
                  ) : (
                    <div className="text-gray-400 text-xs">No domain</div>
                  )}
                  <div className="text-gray-500 text-xs font-mono">{safeString(log.ip)}</div>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                  {safeString(log.protocol?.toUpperCase())}
                </span>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 hidden sm:table-cell">
                {log.port !== null && log.port !== undefined ? log.port : '-'}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(log.status)}`}>
                  {safeString(log.status?.toUpperCase())}
                </span>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                {log.isAnomaly ? (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium whitespace-nowrap">
                    ⚠️ Yes
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;
