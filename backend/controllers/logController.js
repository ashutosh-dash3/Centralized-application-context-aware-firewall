const ApplicationLog = require('../models/ApplicationLog');
const Endpoint = require('../models/Endpoint');

// Anomaly detection thresholds
const ANOMALY_THRESHOLD_REQUESTS = 50; // Number of requests
const ANOMALY_THRESHOLD_SECONDS = 60; // Time window in seconds

/**
 * Detect anomalies based on request frequency
 * Checks if an app has made too many requests in a short time window
 */
const detectAnomaly = async (deviceId, appName) => {
  try {
    const timeWindowAgo = new Date(Date.now() - ANOMALY_THRESHOLD_SECONDS * 1000);
    
    const recentLogs = await ApplicationLog.countDocuments({
      deviceId,
      appName,
      timestamp: { $gte: timeWindowAgo }
    });

    if (recentLogs > ANOMALY_THRESHOLD_REQUESTS) {
      return {
        isAnomaly: true,
        reason: `High frequency: ${recentLogs} requests in last ${ANOMALY_THRESHOLD_SECONDS} seconds`,
        severity: 'high'
      };
    }

    return { isAnomaly: false, reason: '', severity: 'none' };
  } catch (error) {
    console.error('Error detecting anomaly:', error);
    return { isAnomaly: false, reason: '' };
  }
};

/**
 * POST /api/logs
 * Receive logs from endpoint agent
 */
exports.receiveLogs = async (req, res) => {
  try {
    const { deviceId, hostname, ipAddress, logs } = req.body;

    if (!deviceId || !logs || !Array.isArray(logs)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request. deviceId and logs array are required.' 
      });
    }

    // Register/update endpoint
    if (hostname) {
      await Endpoint.findOneAndUpdate(
        { deviceId },
        { 
          hostname, 
          ipAddress,
          lastSeen: new Date(),
          status: 'active'
        },
        { upsert: true, new: true }
      );
    }

    // Process each log entry
    const processedLogs = [];
    for (const log of logs) {
      const { appName, domain, ip, protocol, port, status } = log;

      // Check for anomalies
      const anomalyResult = await detectAnomaly(deviceId, appName);

      const logEntry = {
        deviceId,
        appName,
        domain: domain || '',
        ip,
        protocol: protocol || 'UNKNOWN',
        port: port || null,
        status: status || 'allowed',
        isAnomaly: anomalyResult.isAnomaly,
        anomalyReason: anomalyResult.reason
      };

      const savedLog = await ApplicationLog.create(logEntry);
      processedLogs.push(savedLog);

      // Emit via WebSocket if available
      if (req.io) {
        req.io.emit('newLog', logEntry);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Received ${processedLogs.length} logs`,
      count: processedLogs.length
    });

  } catch (error) {
    console.error('Error receiving logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process logs',
      error: error.message 
    });
  }
};

/**
 * GET /api/logs
 * Fetch logs with optional filters
 */
exports.getLogs = async (req, res) => {
  try {
    const { 
      deviceId, 
      appName, 
      status, 
      isAnomaly,
      startDate, 
      endDate,
      page = 1,
      limit = 50 
    } = req.query;

    const query = {};

    if (deviceId) query.deviceId = deviceId;
    if (appName) query.appName = appName;
    if (status) query.status = status;
    if (isAnomaly !== undefined) query.isAnomaly = isAnomaly === 'true';
    if (startDate) query.timestamp = { ...query.timestamp, $gte: new Date(startDate) };
    if (endDate) query.timestamp = { ...query.timestamp, $lte: new Date(endDate) };

    const total = await ApplicationLog.countDocuments(query);
    
    const logs = await ApplicationLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({ 
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch logs',
      error: error.message 
    });
  }
};

/**
 * GET /api/logs/stats
 * Get log statistics for dashboard
 */
exports.getLogStats = async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now - 24 * 60 * 60 * 1000);

    const [
      totalLogs,
      blockedLogs,
      anomalyLogs,
      logsLast24h
    ] = await Promise.all([
      ApplicationLog.countDocuments(),
      ApplicationLog.countDocuments({ status: 'blocked' }),
      ApplicationLog.countDocuments({ isAnomaly: true }),
      ApplicationLog.countDocuments({ timestamp: { $gte: last24Hours } })
    ]);

    // Get top applications by request count
    const topApps = await ApplicationLog.aggregate([
      { $group: { _id: '$appName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get protocol distribution
    const protocolDistribution = await ApplicationLog.aggregate([
      { $group: { _id: '$protocol', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        blockedLogs,
        anomalyLogs,
        logsLast24h,
        topApps,
        protocolDistribution
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stats',
      error: error.message 
    });
  }
};
