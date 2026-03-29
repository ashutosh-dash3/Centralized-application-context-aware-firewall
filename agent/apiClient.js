const axios = require('axios');

/**
 * API Client for communicating with the backend server
 * Handles log submission and policy fetching with retry mechanism
 */
class ApiClient {
  constructor(baseUrl, deviceId) {
    this.baseUrl = baseUrl;
    this.deviceId = deviceId;
    this.retryAttempts = 3;
    this.retryDelay = 2000; // 2 seconds
    
    // Create axios instance
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Delay helper for retry mechanism
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send logs to backend with retry mechanism
   * @param {Array} logs - Array of log entries
   * @param {Object} endpointInfo - Device information (hostname, ipAddress)
   */
  async sendLogs(logs, endpointInfo = {}) {
    if (!logs || logs.length === 0) {
      return null;
    }

    const payload = {
      deviceId: this.deviceId,
      hostname: endpointInfo.hostname || 'Unknown',
      ipAddress: endpointInfo.ipAddress || '',
      logs
    };

    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`[API] Sending ${logs.length} logs to backend (attempt ${attempt}/${this.retryAttempts})`);
        
        const response = await this.client.post('/api/logs', payload);
        
        console.log(`[API] Successfully sent logs: ${response.data.message}`);
        return response.data;
        
      } catch (error) {
        lastError = error;
        console.error(`[API] Error sending logs (attempt ${attempt}):`, error.message);
        
        if (attempt < this.retryAttempts) {
          console.log(`[API] Retrying in ${this.retryDelay}ms...`);
          await this.delay(this.retryDelay);
          // Increase delay for next attempt (exponential backoff)
          this.retryDelay *= 2;
        }
      }
    }

    console.error(`[API] Failed to send logs after ${this.retryAttempts} attempts`);
    throw lastError;
  }

  /**
   * Fetch policies from backend for this device
   */
  async fetchPolicies() {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`[API] Fetching policies for device ${this.deviceId} (attempt ${attempt}/${this.retryAttempts})`);
        
        const response = await this.client.get(`/api/policies/${this.deviceId}`);
        
        console.log(`[API] Fetched ${response.data.data.length} policies`);
        return response.data.data;
        
      } catch (error) {
        lastError = error;
        console.error(`[API] Error fetching policies (attempt ${attempt}):`, error.message);
        
        if (attempt < this.retryAttempts) {
          console.log(`[API] Retrying in ${this.retryDelay}ms...`);
          await this.delay(this.retryDelay);
          this.retryDelay *= 2;
        }
      }
    }

    console.error(`[API] Failed to fetch policies after ${this.retryAttempts} attempts`);
    throw lastError;
  }

  /**
   * Register this endpoint with the backend
   */
  async registerEndpoint(hostname, ipAddress) {
    try {
      const response = await this.client.post('/api/endpoints', {
        deviceId: this.deviceId,
        hostname,
        ipAddress
      });
      
      console.log('[API] Endpoint registered successfully');
      return response.data;
    } catch (error) {
      console.error('[API] Error registering endpoint:', error.message);
      throw error;
    }
  }
}

module.exports = ApiClient;
