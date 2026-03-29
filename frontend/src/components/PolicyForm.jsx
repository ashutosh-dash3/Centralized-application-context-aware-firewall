import React, { useState } from 'react';

/**
 * Policy Form Component - Create/Edit firewall policies
 */
const PolicyForm = ({ onSubmit, initialData = null, devices = [] }) => {
  const [formData, setFormData] = useState(initialData || {
    deviceId: '',
    appName: '',
    allowedDomains: [],
    blockedDomains: [],
    allowedIPs: [],
    blockedIPs: [],
    enabled: true,
    description: ''
  });

  const [domainInput, setDomainInput] = useState('');
  const [ipInput, setIpInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addDomain = (type) => {
    if (!domainInput.trim()) return;
    
    const domains = type === 'allowed' 
      ? [...formData.allowedDomains, domainInput.trim()]
      : [...formData.blockedDomains, domainInput.trim()];
    
    setFormData({ ...formData, [type === 'allowed' ? 'allowedDomains' : 'blockedDomains']: domains });
    setDomainInput('');
  };

  const removeDomain = (type, index) => {
    const domains = type === 'allowed'
      ? formData.allowedDomains.filter((_, i) => i !== index)
      : formData.blockedDomains.filter((_, i) => i !== index);
    
    setFormData({ ...formData, [type === 'allowed' ? 'allowedDomains' : 'blockedDomains']: domains });
  };

  const addIP = (type) => {
    if (!ipInput.trim()) return;
    
    const ips = type === 'allowed'
      ? [...formData.allowedIPs, ipInput.trim()]
      : [...formData.blockedIPs, ipInput.trim()];
    
    setFormData({ ...formData, [type === 'allowed' ? 'allowedIPs' : 'blockedIPs']: ips });
    setIpInput('');
  };

  const removeIP = (type, index) => {
    const ips = type === 'allowed'
      ? formData.allowedIPs.filter((_, i) => i !== index)
      : formData.blockedIPs.filter((_, i) => i !== index);
    
    setFormData({ ...formData, [type === 'allowed' ? 'allowedIPs' : 'blockedIPs']: ips });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Device Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Device *
        </label>
        <select
          value={formData.deviceId}
          onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select a device</option>
          {devices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.hostname} ({device.deviceId})
            </option>
          ))}
        </select>
      </div>

      {/* Application Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Application Name *
        </label>
        <input
          type="text"
          value={formData.appName}
          onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
          placeholder="e.g., chrome.exe, spotify.exe"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Domains Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Allowed Domains */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed Domains
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="*.example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDomain('allowed'))}
            />
            <button
              type="button"
              onClick={() => addDomain('allowed')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Add
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {formData.allowedDomains.map((domain, index) => (
              <div key={index} className="flex justify-between items-center bg-green-50 px-3 py-2 rounded text-sm">
                <span>{domain}</span>
                <button
                  type="button"
                  onClick={() => removeDomain('allowed', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Blocked Domains */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blocked Domains
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="malware.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDomain('blocked'))}
            />
            <button
              type="button"
              onClick={() => addDomain('blocked')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Add
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {formData.blockedDomains.map((domain, index) => (
              <div key={index} className="flex justify-between items-center bg-red-50 px-3 py-2 rounded text-sm">
                <span>{domain}</span>
                <button
                  type="button"
                  onClick={() => removeDomain('blocked', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IPs Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Allowed IPs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed IPs
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="192.168.1.0/24"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIP('allowed'))}
            />
            <button
              type="button"
              onClick={() => addIP('allowed')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Add
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {formData.allowedIPs.map((ip, index) => (
              <div key={index} className="flex justify-between items-center bg-green-50 px-3 py-2 rounded text-sm">
                <span>{ip}</span>
                <button
                  type="button"
                  onClick={() => removeIP('allowed', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Blocked IPs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blocked IPs
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="10.0.0.1"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIP('blocked'))}
            />
            <button
              type="button"
              onClick={() => addIP('blocked')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Add
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {formData.blockedIPs.map((ip, index) => (
              <div key={index} className="flex justify-between items-center bg-red-50 px-3 py-2 rounded text-sm">
                <span>{ip}</span>
                <button
                  type="button"
                  onClick={() => removeIP('blocked', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description for this policy"
          rows="2"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          {initialData ? 'Update Policy' : 'Create Policy'}
        </button>
        <button
          type="button"
          onClick={() => setFormData({
            deviceId: '',
            appName: '',
            allowedDomains: [],
            blockedDomains: [],
            allowedIPs: [],
            blockedIPs: [],
            enabled: true,
            description: ''
          })}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors"
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default PolicyForm;
