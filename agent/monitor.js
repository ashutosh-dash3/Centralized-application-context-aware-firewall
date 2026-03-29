const psList = require('ps-list').default || require('ps-list');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Network Monitor - Monitors applications and their network activity
 * Uses ps-list for process detection and netstat for network connections
 */
class NetworkMonitor {
  constructor() {
    this.processCache = new Map();
    this.connectionCache = new Map();
  }

  /**
   * Get all running processes with network activity
   */
  async getRunningProcesses() {
    try {
      const processes = await psList({ all: true });
      
      // Cache processes by PID for quick lookup
      this.processCache.clear();
      processes.forEach(proc => {
        this.processCache.set(proc.pid, proc);
      });

      return processes;
    } catch (error) {
      console.error('[Monitor] Error getting processes:', error.message);
      return [];
    }
  }

  /**
   * Get active network connections using netstat (Windows)
   * Returns array of connections with process information
   */
  async getNetworkConnections() {
    try {
      // Use netstat to get all connections with PIDs
      const { stdout } = await execPromise(
        'netstat -ano 2>&1'
      );

      if (!stdout) {
        return [];
      }

      const lines = stdout.trim().split('\n');
      const connections = [];

      for (const line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;
        
        const parts = line.trim().split(/\s+/);
        
        if (parts.length >= 5) {
          const [protocol, localAddress, foreignAddress, state, pid] = parts;
          
          // Only process ESTABLISHED or LISTENING connections
          if (!state || (state !== 'ESTABLISHED' && state !== 'LISTENING')) {
            continue;
          }
          
          // Parse foreign address to extract IP and port
          const [ip, port] = this.parseAddress(foreignAddress);
          
          if (ip && pid && !isNaN(parseInt(pid))) {
            connections.push({
              protocol: this.normalizeProtocol(protocol),
              localAddress,
              foreignAddress,
              ip,
              port: port ? parseInt(port) : null,
              pid: parseInt(pid),
              state
            });
          }
        }
      }

      // Cache connections
      this.connectionCache.clear();
      connections.forEach(conn => {
        const key = `${conn.pid}-${conn.ip}-${conn.port}`;
        this.connectionCache.set(key, conn);
      });

      return connections;
    } catch (error) {
      console.error('[Monitor] Error getting network connections:', error.message);
      return [];
    }
  }

  /**
   * Parse address string (IP:Port)
   */
  parseAddress(address) {
    if (!address) return [null, null];
    
    // Handle IPv4 addresses
    const lastColon = address.lastIndexOf(':');
    if (lastColon !== -1) {
      const ip = address.substring(0, lastColon);
      const port = address.substring(lastColon + 1);
      return [ip, port];
    }
    
    return [address, null];
  }

  /**
   * Normalize protocol name
   */
  normalizeProtocol(protocol) {
    if (!protocol) return 'UNKNOWN';
    
    const proto = protocol.toUpperCase();
    if (proto.includes('TCP')) return 'TCP';
    if (proto.includes('UDP')) return 'UDP';
    return 'UNKNOWN';
  }

  /**
   * Infer protocol based on port and connection info
   */
  inferProtocol(port, baseProtocol) {
    if (baseProtocol === 'UDP') return 'UDP';
    
    // Common port-based inference
    switch (port) {
      case 80:
        return 'HTTP';
      case 443:
        return 'HTTPS';
      case 53:
        return 'DNS';
      case 22:
        return 'SSH';
      case 21:
        return 'FTP';
      case 25:
        return 'SMTP';
      default:
        return baseProtocol || 'TCP';
    }
  }

  /**
   * Resolve domain from IP (basic implementation)
   * In production, you'd use DNS lookup
   */
  async resolveDomain(ip) {
    // Skip private IPs and localhost
    if (this.isPrivateIP(ip) || ip === '127.0.0.1' || ip === '*') {
      return '';
    }

    // For MVP, simulate domain resolution based on common patterns
    // In production: use dns.lookup() or external API
    try {
      // Simple simulation for demo purposes
      // This would normally be a DNS lookup
      const dnsCache = {
        '8.8.8.8': 'dns.google.com',
        '1.1.1.1': 'one.one.one.one',
        '142.250.185.78': 'google.com',
        '157.240.1.35': 'facebook.com',
        '31.13.65.36': 'facebook.com',
        '104.244.42.193': 'twitter.com',
        '172.217.14.110': 'google.com',
        '52.94.236.248': 'amazon.com',
        '54.239.28.85': 'amazon.com',
        '13.107.42.14': 'microsoft.com',
        '20.190.151.70': 'microsoft.com',
        '151.101.1.140': 'reddit.com',
        '185.199.108.153': 'github.com',
        '140.82.121.4': 'github.com'
      };

      if (dnsCache[ip]) {
        return dnsCache[ip];
      }

      // For unknown IPs, return empty (we'll still enforce policy on IP)
      return '';
    } catch {
      return '';
    }
  }

  /**
   * Normalize domain for comparison
   * Removes www., converts to lowercase
   */
  normalizeDomain(domain) {
    if (!domain || domain === '') return '';
    
    let normalized = domain.toLowerCase();
    
    // Remove www. prefix
    if (normalized.startsWith('www.')) {
      normalized = normalized.substring(4);
    }
    
    // Remove trailing dot if present
    if (normalized.endsWith('.')) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  }

  /**
   * Check if IP is private
   */
  isPrivateIP(ip) {
    if (!ip || typeof ip !== 'string') return false;
    
    return (
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.16.') ||
      ip.startsWith('172.17.') ||
      ip.startsWith('172.18.') ||
      ip.startsWith('172.19.') ||
      ip.startsWith('172.2') ||
      ip.startsWith('172.30.') ||
      ip.startsWith('172.31.') ||
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip === '0.0.0.0'
    );
  }

  /**
   * Main monitoring function - collects all network activity data
   * Returns array of log entries ready to send to backend
   */
  async collectNetworkActivity() {
    try {
      const [processes, connections] = await Promise.all([
        this.getRunningProcesses(),
        this.getNetworkConnections()
      ]);

      const logs = [];
      const seenConnections = new Set();

      for (const conn of connections) {
        // Skip duplicate connections
        const connKey = `${conn.pid}-${conn.ip}-${conn.port}`;
        if (seenConnections.has(connKey)) continue;
        seenConnections.add(connKey);

        // Find the process for this connection
        const process = this.processCache.get(conn.pid);
        
        if (process) {
          const appName = process.name;
          const protocol = this.inferProtocol(conn.port, conn.protocol);
          const domain = await this.resolveDomain(conn.ip);

          logs.push({
            appName,
            domain,
            ip: conn.ip,
            protocol,
            port: conn.port,
            status: 'allowed', // Default status, will be updated by policy manager
            timestamp: new Date().toISOString()
          });
        }
      }

      console.log(`[Monitor] Collected ${logs.length} network activity entries`);
      return logs;

    } catch (error) {
      console.error('[Monitor] Error collecting network activity:', error.message);
      return [];
    }
  }

  /**
   * Get process count
   */
  getProcessCount() {
    return this.processCache.size;
  }

  /**
   * Get connection count
   */
  getConnectionCount() {
    return this.connectionCache.size;
  }
}

module.exports = NetworkMonitor;
