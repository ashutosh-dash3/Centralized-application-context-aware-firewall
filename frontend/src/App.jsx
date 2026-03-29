import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import Policies from './pages/Policies';
import Endpoints from './pages/Endpoints';

/**
 * Main Application Component
 */
function App() {
  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        {/* Sidebar Navigation - Full width on mobile, fixed on desktop */}
        <div className="md:w-64 md:flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/endpoints" element={<Endpoints />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
