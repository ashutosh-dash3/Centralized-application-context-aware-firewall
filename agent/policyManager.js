/**
 * Policy Manager - Manages and enforces firewall policies
 * Maintains local rule cache and checks connections against rules
 */
class PolicyManager {
  constructor() {
    this.policies = [];
    this.lastFetch = null;
    this.cacheExpiryMs = 60000; // Cache policies for 1 minute
  }

  /**
   * Update local policy cache
   * @param {Array} policies - Array of policy objects from backend
   */
  updatePolicies(policies) {
    this.policies = policies || [];
    this.lastFetch = new Date();
    console.log(`[Policy] Updated ${this.policies.length} policies`);
  }

  /**
   * Check if policies need to be refreshed
   */
  shouldRefreshPolicies() {
    if (!this.lastFetch) return true;
    
    const now = new Date();
    const timeSinceFetch = now - this.lastFetch;
    
    return timeSinceFetch > this.cacheExpiryMs;
  }

  /**
   * Get policies for a specific application
   * @param {string} appName - Application name
   */
  getPoliciesForApp(appName) {
    return this.policies.filter(p => 
      p.appName.toLowerCase() === appName.toLowerCase() && p.enabled !== false
    );
  }

  /**
   * Check if a domain is in the blocked list
   * @param {string} domain - Domain to check
   * @param {Array} blockedDomains - List of blocked domains
   */
  isDomainBlocked(domain, blockedDomains) {
    if (!domain || !blockedDomains || blockedDomains.length === 0) {
      return false;
    }

    // Normalize domain for comparison (remove www., lowercase)
    const normalizedDomain = this.normalizeDomain(domain);
    
    console.log(`[Policy] Checking if "${normalizedDomain}" is blocked. Blocked list:`, blockedDomains);
    
    return blockedDomains.some(blocked => {
      const normalizedBlocked = this.normalizeDomain(blocked);
      
      // Exact match
      if (normalizedDomain === normalizedBlocked) {
        console.log(`[Policy] MATCH: "${normalizedDomain}" === "${normalizedBlocked}"`);
        return true;
      }
      
      // Wildcard match (*.example.com matches sub.example.com)
      if (normalizedBlocked.startsWith('*.')) {
        const baseDomain = normalizedBlocked.substring(2);
        if (normalizedDomain.endsWith(baseDomain)) {
          console.log(`[Policy] WILDCARD MATCH: "${normalizedDomain}" ends with "${baseDomain}"`);
          return true;
        }
      }
      
      return false;
    });
  }

  /**
   * Normalize domain for comparison
   * Removes www., converts to lowercase, removes trailing dots
   */
  normalizeDomain(domain) {
    if (!domain || domain === '') return '';
    
    let normalized = domain.toLowerCase().trim();
    
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
   * Check if an IP is in the blocked list
   * @param {string} ip - IP address to check
   * @param {Array} blockedIPs - List of blocked IPs
   */
  isIPBlocked(ip, blockedIPs) {
    if (!ip || !blockedIPs || blockedIPs.length === 0) {
      return false;
    }

    return blockedIPs.some(blocked => {
      // Exact match
      if (ip === blocked) return true;
      
      // CIDR notation support (basic implementation)
      if (blocked.includes('/')) {
        return this.isIPInCIDR(ip, blocked);
      }
      
      return false;
    });
  }

  /**
   * Check if IP is in CIDR range (basic implementation)
   */
  isIPInCIDR(ip, cidr) {
    // Simple implementation - in production, use ipaddr.js library
    try {
      const [range, bits] = cidr.split('/');
      const mask = ~(Math.pow(2, 32 - parseInt(bits)) - 1);
      
      const ipNum = this.ipToNumber(ip);
      const rangeNum = this.ipToNumber(range);
      
      return (ipNum & mask) === (rangeNum & mask);
    } catch {
      return false;
    }
  }

  /**
   * Convert IP string to number
   */
  ipToNumber(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  /**
   * Check if a domain is in the allowed list
   * @param {string} domain - Domain to check
   * @param {Array} allowedDomains - List of allowed domains
   */
  isDomainAllowed(domain, allowedDomains) {
    if (!allowedDomains || allowedDomains.length === 0) {
      // If no allowed list, everything is allowed by default
      return true;
    }

    if (!domain) return false;

    const lowerDomain = domain.toLowerCase();
    
    return allowedDomains.some(allowed => {
      const lowerAllowed = allowed.toLowerCase();
      
      // Exact match
      if (lowerDomain === lowerAllowed) return true;
      
      // Wildcard match
      if (lowerAllowed.startsWith('*.')) {
        const baseDomain = lowerAllowed.substring(2);
        return lowerDomain.endsWith(baseDomain);
      }
      
      return false;
    });
  }

  /**
   * Check if an IP is in the allowed list
   */
  isIPAllowed(ip, allowedIPs) {
    if (!allowedIPs || allowedIPs.length === 0) {
      // If no allowed list, everything is allowed by default
      return true;
    }

    if (!ip) return false;

    return allowedIPs.some(allowed => {
      if (ip === allowed) return true;
      
      if (allowed.includes('/')) {
        return this.isIPInCIDR(ip, allowed);
      }
      
      return false;
    });
  }

  /**
   * Enforce policy for a connection
   * Returns updated log entry with status
   * @param {Object} logEntry - Log entry with appName, domain, ip
   */
  enforcePolicy(logEntry) {
    const { appName, domain, ip } = logEntry;
    
    console.log(`\n[Policy] === Checking policy for ${appName} -> ${domain || ip} ===`);
    
    // Get applicable policies for this app
    const appPolicies = this.getPoliciesForApp(appName);
    
    if (appPolicies.length === 0) {
      // No policies for this app, allow by default
      console.log(`[Policy] No policies found for ${appName}, allowing by default`);
      logEntry.status = 'allowed';
      return logEntry;
    }

    console.log(`[Policy] Found ${appPolicies.length} policy(s) for ${appName}`);

    // Check each policy (in MVP, we'll use the first matching policy)
    for (const policy of appPolicies) {
      const { allowedDomains, blockedDomains, allowedIPs, blockedIPs } = policy;

      console.log(`[Policy] Policy: allowed=[${allowedDomains}], blocked=[${blockedDomains}]`);

      // Check blocked domains first (higher priority)
      if (domain && this.isDomainBlocked(domain, blockedDomains)) {
        logEntry.status = 'blocked';
        logEntry.blockReason = `Domain ${domain} is blocked by policy`;
        console.log(`[Policy] ❌ BLOCKED: ${appName} -> ${domain} (Domain blocked)`);
        return logEntry;
      }

      // Check blocked IPs
      if (this.isIPBlocked(ip, blockedIPs)) {
        logEntry.status = 'blocked';
        logEntry.blockReason = `IP ${ip} is blocked by policy`;
        console.log(`[Policy] ❌ BLOCKED: ${appName} -> ${ip} (IP blocked)`);
        return logEntry;
      }

      // Check if domain is explicitly allowed (only if allowedDomains list exists)
      if (domain && allowedDomains && allowedDomains.length > 0) {
        if (!this.isDomainAllowed(domain, allowedDomains)) {
          logEntry.status = 'blocked';
          logEntry.blockReason = `Domain ${domain} is not in allowed list`;
          console.log(`[Policy] ❌ BLOCKED: ${appName} -> ${domain} (Domain not allowed)`);
          return logEntry;
        }
      }

      // Check if IP is explicitly allowed (only if allowedIPs list exists)
      if (allowedIPs && allowedIPs.length > 0) {
        if (!this.isIPAllowed(ip, allowedIPs)) {
          logEntry.status = 'blocked';
          logEntry.blockReason = `IP ${ip} is not in allowed list`;
          console.log(`[Policy] ❌ BLOCKED: ${appName} -> ${ip} (IP not allowed)`);
          return logEntry;
        }
      }
    }

    // Passed all checks
    console.log(`[Policy] ✓ ALLOWED: ${appName} -> ${domain || ip}`);
    logEntry.status = 'allowed';
    return logEntry;
  }

  /**
   * Enforce policies on multiple log entries
   */
  enforcePolicies(logs) {
    return logs.map(log => this.enforcePolicy(log));
  }

  /**
   * Get statistics about current policies
   */
  getStats() {
    const stats = {
      totalPolicies: this.policies.length,
      enabledPolicies: this.policies.filter(p => p.enabled !== false).length,
      appsWithPolicies: new Set(this.policies.map(p => p.appName)).size,
      totalBlockedDomains: this.policies.reduce((acc, p) => acc + (p.blockedDomains?.length || 0), 0),
      totalBlockedIPs: this.policies.reduce((acc, p) => acc + (p.blockedIPs?.length || 0), 0)
    };
    
    return stats;
  }
}

module.exports = PolicyManager;
