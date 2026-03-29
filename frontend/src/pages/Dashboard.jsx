import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import LogTable from '../components/LogTable';
import { logsAPI, endpointsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * Dashboard Page - Main overview of the firewall system
 */
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [endpointStats, setEndpointStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [logsStats, endpoints] = await Promise.all([
        logsAPI.getStats(),
        endpointsAPI.getEndpoints()
      ]);

      setStats(logsStats.data.data);
      setEndpointStats(endpoints.data.stats);
      setRecentLogs(logsStats.data.data.topApps || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const protocolData = stats?.protocolDistribution?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your endpoint firewall system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Endpoints"
          value={endpointStats.total}
          icon="💻"
          color="blue"
        />
        <StatCard
          title="Active Endpoints"
          value={endpointStats.active}
          icon="✓"
          color="green"
        />
        <StatCard
          title="Total Logs"
          value={stats?.totalLogs || 0}
          icon="📋"
          color="purple"
        />
        <StatCard
          title="Anomalies Detected"
          value={stats?.anomalyLogs || 0}
          icon="⚠️"
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Protocol Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Protocol Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={protocolData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {protocolData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Applications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Applications by Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.topApps || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Anomalies */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Suspicious Activity</h2>
          <Link to="/logs?anomaly=true" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All →
          </Link>
        </div>
        <LogTable logs={recentLogs.slice(0, 5)} loading={false} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/logs" className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 transition-colors">
          <h3 className="font-semibold text-blue-900">View All Logs</h3>
          <p className="text-sm text-blue-700 mt-1">Monitor network activity</p>
        </Link>
        <Link to="/policies" className="bg-green-50 hover:bg-green-100 rounded-lg p-4 transition-colors">
          <h3 className="font-semibold text-green-900">Manage Policies</h3>
          <p className="text-sm text-green-700 mt-1">Create firewall rules</p>
        </Link>
        <Link to="/endpoints" className="bg-purple-50 hover:bg-purple-100 rounded-lg p-4 transition-colors">
          <h3 className="font-semibold text-purple-900">View Endpoints</h3>
          <p className="text-sm text-purple-700 mt-1">Check device status</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
