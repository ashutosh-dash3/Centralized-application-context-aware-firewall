import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Sidebar Navigation Component
 */
const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/logs', label: 'Logs', icon: '📋' },
    { path: '/policies', label: 'Policies', icon: '🛡️' },
    { path: '/endpoints', label: 'Endpoints', icon: '💻' }
  ];

  return (
    <div className="w-full md:w-64 bg-gray-900 text-white p-4">
      <div className="mb-8">
        <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
          <span>🔥</span>
          <span className="hidden lg:inline">Endpoint Firewall</span>
          <span className="lg:hidden">Firewall</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1 hidden md:block">Central Management</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium hidden md:inline">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-gray-800">
        <div className="text-xs text-gray-500 hidden md:block">
          <p>Version 1.0.0</p>
          <p className="mt-1">MVP Build</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
