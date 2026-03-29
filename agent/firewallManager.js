/**
 * Windows Firewall Manager - REAL enforcement using netsh commands
 * Creates and manages Windows Firewall rules to block/allow traffic
 */
const { exec } = require('child_process');
const { promisify } = require('util');
const dns = require('dns').promises;

const execPromise = promisify(exec);

class FirewallManager {
  constructor() {
    this.activeRules = new Map(); // Track created firewall rules
    this.rulePrefix = 'EFW_'; // Endpoint Firewall rule prefix
    this.dnsCache = new Map(); // Cache DNS lookups
    this.dnsCacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Check if running with admin privileges
   */
  async checkAdminPrivileges() {
    try {
      await execPromise('net session >nul 2>&1');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Resolve domain to IP addresses using DNS
   */
  async resolveDomain(domain) {
    // Check cache first
    const cached = this.dnsCache.get(domain);
    if (cached && Date.now() - cached.timestamp < this.dnsCacheExpiry) {
      return cached.ips;
    }

    try {
      console.log(`[Firewall] Resolving DNS: ${domain}`);
      
      // Try IPv4 first
      const addresses = await dns.resolve4(domain);
      
      // Also try IPv6 if available
      try {
        const addresses6 = await dns.resolve6(domain);
        addresses.push(...addresses6);
      } catch (e) {
        // IPv6 not available, ignore
      }

      // Cache the result
      this.dnsCache.set(domain, {
        ips: addresses,
        timestamp: Date.now()
      });

      console.log(`[Firewall] Resolved ${domain} → [${addresses.join(', ')}]`);
      return addresses;
    } catch (error) {
      console.error(`[Firewall] DNS resolution failed for ${domain}:`, error.message);
      return [];
    }
  }

  /**
   * Generate firewall rule name
   */
  getRuleName(appName, target, type) {
    // Sanitize names for Windows Firewall
    const safeAppName = appName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeTarget = target.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${this.rulePrefix}${type}_${safeAppName}_${safeTarget}`;
  }

  /**
   * Create a firewall block rule for an IP
   */
  async createBlockRule(appName, ip, domain, protocol = 'any') {
    const ruleName = this.getRuleName(appName, domain || ip, 'BLOCK');
    
    try {
      // Check if rule already exists
      const exists = await this.ruleExists(ruleName);
      
      if (exists) {
        console.log(`[Firewall] Rule already exists: ${ruleName}`);
        return { success: true, ruleName, created: false };
      }

      // Build netsh command
      let command = `netsh advfirewall firewall add rule name="${ruleName}" dir=out action=block remoteip="${ip}"`;
      
      // Add protocol if specified
      if (protocol && protocol !== 'any') {
        command += ` protocol=${protocol}`;
      }

      // Add program path if we can determine it
      const programPath = await this.getProgramPath(appName);
      if (programPath) {
        command += ` program="${programPath}"`;
      }

      // Add description
      command += ` description="Endpoint Firewall: Block ${domain || ip} for ${appName}"`;

      console.log(`[Firewall] Executing: ${command}`);
      await execPromise(command);

      // Track the rule
      this.activeRules.set(ruleName, {
        appName,
        ip,
        domain,
        protocol,
        createdAt: new Date(),
        type: 'block'
      });

      console.log(`[Firewall] ✅ Created block rule: ${ruleName}`);
      return { success: true, ruleName, created: true };

    } catch (error) {
      console.error(`[Firewall] ❌ Failed to create block rule: ${error.message}`);
      return { success: false, error: error.message, ruleName };
    }
  }

  /**
   * Create a firewall allow rule
   */
  async createAllowRule(appName, ip, domain, protocol = 'any') {
    const ruleName = this.getRuleName(appName, domain || ip, 'ALLOW');
    
    try {
      const exists = await this.ruleExists(ruleName);
      
      if (exists) {
        console.log(`[Firewall] Allow rule already exists: ${ruleName}`);
        return { success: true, ruleName, created: false };
      }

      let command = `netsh advfirewall firewall add rule name="${ruleName}" dir=out action=allow remoteip="${ip}"`;
      
      if (protocol && protocol !== 'any') {
        command += ` protocol=${protocol}`;
      }

      const programPath = await this.getProgramPath(appName);
      if (programPath) {
        command += ` program="${programPath}"`;
      }

      command += ` description="Endpoint Firewall: Allow ${domain || ip} for ${appName}"`;

      await execPromise(command);

      this.activeRules.set(ruleName, {
        appName,
        ip,
        domain,
        protocol,
        createdAt: new Date(),
        type: 'allow'
      });

      console.log(`[Firewall] ✅ Created allow rule: ${ruleName}`);
      return { success: true, ruleName, created: true };

    } catch (error) {
      console.error(`[Firewall] ❌ Failed to create allow rule: ${error.message}`);
      return { success: false, error: error.message, ruleName };
    }
  }

  /**
   * Delete a firewall rule
   */
  async deleteRule(ruleName) {
    try {
      const command = `netsh advfirewall firewall delete rule name="${ruleName}"`;
      await execPromise(command);
      
      this.activeRules.delete(ruleName);
      console.log(`[Firewall] 🗑️ Deleted rule: ${ruleName}`);
      return { success: true };

    } catch (error) {
      console.error(`[Firewall] Failed to delete rule ${ruleName}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if a firewall rule exists
   */
  async ruleExists(ruleName) {
    try {
      const command = `netsh advfirewall firewall show rule name="${ruleName}"`;
      const { stdout } = await execPromise(command);
      return stdout && stdout.includes(ruleName);
    } catch {
      return false;
    }
  }

  /**
   * Get program path from process name
   */
  async getProgramPath(processName) {
    try {
      // Use wmic to find process executable path
      const command = `wmic process where "name='${processName}'" get executablepath 2>nul`;
      const { stdout } = await execPromise(command);
      
      const lines = stdout.trim().split('\n');
      if (lines.length > 1 && lines[1].trim()) {
        return lines[1].trim();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Enforce policy by creating firewall rules
   */
  async enforcePolicy(logEntry) {
    const { appName, domain, ip, status, blockReason } = logEntry;

    // Only enforce if status is blocked
    if (status !== 'blocked') {
      return logEntry;
    }

    console.log(`\n[Firewall] 🔒 ENFORCING BLOCK: ${appName} -> ${domain || ip}`);

    // If we have a domain, resolve it to IPs
    let ipsToBlock = [];
    
    if (domain) {
      ipsToBlock = await this.resolveDomain(domain);
      // Also block the provided IP if different
      if (ip && !ipsToBlock.includes(ip)) {
        ipsToBlock.push(ip);
      }
    } else if (ip) {
      ipsToBlock = [ip];
    }

    // Create block rules for all IPs
    const results = [];
    for (const targetIp of ipsToBlock) {
      const result = await this.createBlockRule(appName, targetIp, domain);
      results.push(result);
    }

    // Update log entry with enforcement details
    logEntry.enforcement = {
      type: 'firewall_block',
      rulesCreated: results.filter(r => r.created).length,
      ips: ipsToBlock,
      timestamp: new Date().toISOString()
    };

    console.log(`[Firewall] 🛡️ Enforcement complete: ${results.filter(r => r.success).length}/${results.length} rules successful`);

    return logEntry;
  }

  /**
   * Remove enforcement for a specific target
   */
  async removeEnforcement(appName, domain, ip) {
    console.log(`\n[Firewall] Removing enforcement for ${appName} -> ${domain || ip}`);

    const rulesToRemove = [];
    
    // Find matching rules
    for (const [ruleName, ruleInfo] of this.activeRules) {
      if (ruleInfo.appName === appName && 
          (ruleInfo.domain === domain || ruleInfo.ip === ip)) {
        rulesToRemove.push(ruleName);
      }
    }

    // Delete the rules
    for (const ruleName of rulesToRemove) {
      await this.deleteRule(ruleName);
    }

    console.log(`[Firewall] Removed ${rulesToRemove.length} rule(s)`);
    return rulesToRemove.length;
  }

  /**
   * Clear all firewall rules created by this agent
   */
  async clearAllRules() {
    console.log('[Firewall] Clearing all endpoint firewall rules...');

    const ruleNames = Array.from(this.activeRules.keys());
    let successCount = 0;
    let failCount = 0;

    for (const ruleName of ruleNames) {
      const result = await this.deleteRule(ruleName);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log(`[Firewall] Cleared ${successCount} rules successfully, ${failCount} failed`);
    return { success: successCount, failed: failCount };
  }

  /**
   * Get statistics about active rules
   */
  getStats() {
    const blockRules = Array.from(this.activeRules.values()).filter(r => r.type === 'block');
    const allowRules = Array.from(this.activeRules.values()).filter(r => r.type === 'allow');

    return {
      totalRules: this.activeRules.size,
      blockRules: blockRules.length,
      allowRules: allowRules.length,
      blockedDomains: [...new Set(blockRules.map(r => r.domain))].length,
      blockedIPs: [...new Set(blockRules.map(r => r.ip))].length,
      affectedApps: [...new Set(blockRules.map(r => r.appName))].length
    };
  }

  /**
   * List all active rules
   */
  listRules() {
    return Array.from(this.activeRules.entries()).map(([name, info]) => ({
      name,
      ...info
    }));
  }
}

module.exports = FirewallManager;
