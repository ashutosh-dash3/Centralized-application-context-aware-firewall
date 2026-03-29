require('dotenv').config();
const os = require('os');
const ApiClient = require('./apiClient');
const NetworkMonitor = require('./monitor');
const PolicyManager = require('./policyManager');
const FirewallManager = require('./firewallManager');

/**
 * Endpoint Firewall Agent - Main Entry Point
 * 
 * This agent monitors network activity, enforces policies,
 * and reports to the central management server.
 */
class EndpointAgent {
  constructor() {
    // Configuration
    this.backendUrl = process.env.BACKEND_URL || 'https://centralized-application-context-aware.onrender.com';
    this.deviceId = this.generateDeviceId();
    this.hostname = os.hostname();
    this.ipAddress = this.getPrimaryIPAddress();
    
    // Components
    this.apiClient = new ApiClient(this.backendUrl, this.deviceId);
    this.monitor = new NetworkMonitor();
    this.policyManager = new PolicyManager();
    this.firewallManager = new FirewallManager();
    
    // State
    this.isRunning = false;
    this.monitoringInterval = parseInt(process.env.MONITORING_INTERVAL) || 10000; // 10 seconds
    this.policyRefreshInterval = parseInt(process.env.POLICY_REFRESH_INTERVAL) || 60000; // 60 seconds
    
    // Timers
    this.monitoringTimer = null;
    this.policyRefreshTimer = null;
  }

  /**
   * Generate a unique device ID based on hostname and MAC address
   */
  generateDeviceId() {
    const networkInterfaces = os.networkInterfaces();
    let macAddress = 'unknown';
    
    // Get first non-internal interface MAC address
    for (const iface of Object.values(networkInterfaces)) {
      for (const config of iface) {
        if (!config.internal && config.mac !== '00:00:00:00:00:00') {
          macAddress = config.mac.replace(/:/g, '-');
          break;
        }
      }
    }
    
    return `${this.hostname}-${macAddress}`;
  }

  /**
   * Get primary IP address
   */
  getPrimaryIPAddress() {
    const interfaces = os.networkInterfaces();
    
    for (const iface of Object.values(interfaces)) {
      for (const config of iface) {
        if (!config.internal && config.family === 'IPv4') {
          return config.address;
        }
      }
    }
    
    return '127.0.0.1';
  }

  /**
   * Initialize and register with backend
   */
  async initialize() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║   Endpoint Firewall Agent                                 ║');
    console.log('║                                                           ║');
    console.log(`║   Device ID: ${this.deviceId.padEnd(42)} ║`);
    console.log(`║   Hostname: ${this.hostname.padEnd(43)} ║`);
    console.log(`║   Backend: ${this.backendUrl.padEnd(44)} ║`);
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    try {
      // Check admin privileges
      const isAdmin = await this.firewallManager.checkAdminPrivileges();
      if (!isAdmin) {
        console.log('⚠️  WARNING: Not running as Administrator!');
        console.log('🔧 Firewall enforcement may fail. Run as Admin for full functionality.\n');
      } else {
        console.log('✅ Running with Administrator privileges\n');
      }

      // Register with backend
      await this.apiClient.registerEndpoint(this.hostname, this.ipAddress);
      
      // Fetch initial policies
      console.log('[Agent] Fetching initial policies from backend...');
      const policies = await this.apiClient.fetchPolicies();
      this.policyManager.updatePolicies(policies);
      
      if (policies && policies.length > 0) {
        console.log(`[Agent] ✓ Loaded ${policies.length} policy(s):`);
        policies.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.appName}: blocked=[${p.blockedDomains?.join(', ') || 'none'}]`);
        });
      } else {
        console.log('[Agent] ⚠ No policies configured yet. Create policies in the dashboard.');
      }
      
      console.log('[Agent] Initialization complete ✓\n');
      return true;
      
    } catch (error) {
      console.error('[Agent] Initialization failed:', error.message);
      console.log('[Agent] Will retry on next cycle...');
      return false;
    }
  }

  /**
   * Main monitoring cycle
   */
  async monitoringCycle() {
    try {
      console.log('\n[Agent] === Starting monitoring cycle ===');
      
      // Collect network activity
      const rawLogs = await this.monitor.collectNetworkActivity();
      
      if (rawLogs.length === 0) {
        console.log('[Agent] No network activity detected');
        return;
      }
      
      console.log(`[Agent] Collected ${rawLogs.length} connections, enforcing policies...`);
      
      // Enforce policies
      const processedLogs = this.policyManager.enforcePolicies(rawLogs);
      
      // Apply REAL firewall enforcement for blocked connections
      console.log('\n[Firewall] Applying real firewall enforcement...');
      const enforcedLogs = [];
      for (const log of processedLogs) {
        if (log.status === 'blocked') {
          const enforced = await this.firewallManager.enforcePolicy(log);
          enforcedLogs.push(enforced);
        } else {
          enforcedLogs.push(log);
        }
      }
      
      // Count results
      const blockedLogs = enforcedLogs.filter(log => log.status === 'blocked');
      const allowedLogs = enforcedLogs.filter(log => log.status === 'allowed');
      
      if (blockedLogs.length > 0) {
        console.log(`\n[Policy] 🚫 BLOCKED ${blockedLogs.length}/${enforcedLogs.length} connections:`);
        blockedLogs.forEach(log => {
          const enforcementInfo = log.enforcement ? ` [${log.enforcement.rulesCreated || 0} firewall rules]` : '';
          console.log(`  - ${log.appName} -> ${log.domain || log.ip} (${log.blockReason})${enforcementInfo}`);
        });
        
        // Show firewall stats
        const fwStats = this.firewallManager.getStats();
        console.log(`\n[Firewall] Active rules: ${fwStats.totalRules} total (${fwStats.blockRules} blocks, ${fwStats.allowRules} allows)`);
      }
      
      if (allowedLogs.length > 0) {
        console.log(`[Policy] ✓ ALLOWED ${allowedLogs.length}/${enforcedLogs.length} connections`);
      }
      
      // Send all logs to backend for tracking
      await this.apiClient.sendLogs(enforcedLogs, {
        hostname: this.hostname,
        ipAddress: this.ipAddress
      });
      
      console.log(`\n[Agent] ✓ Cycle complete - Processed ${enforcedLogs.length} connections\n`);
      
    } catch (error) {
      console.error('[Agent] Error in monitoring cycle:', error.message);
    }
  }

  /**
   * Policy refresh cycle
   */
  async policyRefreshCycle() {
    try {
      if (this.policyManager.shouldRefreshPolicies()) {
        console.log('[Policy] Refreshing policies from backend...');
        const policies = await this.apiClient.fetchPolicies();
        this.policyManager.updatePolicies(policies);
        
        const stats = this.policyManager.getStats();
        console.log(`[Policy] Stats: ${stats.totalPolicies} total, ${stats.enabledPolicies} enabled, ${stats.blockedDomains.length} blocked domains`);
      }
    } catch (error) {
      console.error('[Agent] Error refreshing policies:', error.message);
    }
  }

  /**
   * Start the agent
   */
  start() {
    if (this.isRunning) {
      console.log('[Agent] Already running');
      return;
    }

    console.log('[Agent] Starting endpoint firewall agent...\n');
    this.isRunning = true;

    // Initial monitoring cycle immediately
    setTimeout(async () => {
      await this.monitoringCycle();
      
      // Set up periodic monitoring
      this.monitoringTimer = setInterval(
        () => this.monitoringCycle(),
        this.monitoringInterval
      );
      
      // Set up periodic policy refresh
      this.policyRefreshTimer = setInterval(
        () => this.policyRefreshCycle(),
        this.policyRefreshInterval
      );
    }, 2000);
  }

  /**
   * Stop the agent
   */
  async stop() {
    if (!this.isRunning) {
      console.log('[Agent] Not running');
      return;
    }

    console.log('\n[Agent] Stopping agent...');
    this.isRunning = false;

    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }

    if (this.policyRefreshTimer) {
      clearInterval(this.policyRefreshTimer);
      this.policyRefreshTimer = null;
    }

    // Optionally clear firewall rules (comment out to persist rules)
    // await this.firewallManager.clearAllRules();

    console.log('[Agent] Agent stopped ✓');
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      deviceId: this.deviceId,
      hostname: this.hostname,
      ipAddress: this.ipAddress,
      backendUrl: this.backendUrl,
      monitoringInterval: this.monitoringInterval,
      policyCacheSize: this.policyManager.policies.length,
      processCount: this.monitor.getProcessCount(),
      connectionCount: this.monitor.getConnectionCount()
    };
  }
}

// Create and start agent instance
const agent = new EndpointAgent();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Agent] Received SIGINT, shutting down...');
  await agent.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[Agent] Received SIGTERM, shutting down...');
  await agent.stop();
  process.exit(0);
});

// Initialize and start
(async () => {
  const initialized = await agent.initialize();
  
  if (initialized) {
    agent.start();
  } else {
    // Retry initialization after delay
    setTimeout(async () => {
      const retry = await agent.initialize();
      if (retry) {
        agent.start();
      }
    }, 5000);
  }
})();

module.exports = EndpointAgent;
