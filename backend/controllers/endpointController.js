const Endpoint = require('../models/Endpoint');

/**
 * POST /api/endpoints
 * Register or update an endpoint
 */
exports.registerEndpoint = async (req, res) => {
  try {
    const { deviceId, hostname, ipAddress } = req.body;

    if (!deviceId || !hostname) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId and hostname are required' 
      });
    }

    const endpoint = await Endpoint.findOneAndUpdate(
      { deviceId },
      { 
        hostname, 
        ipAddress,
        lastSeen: new Date(),
        status: 'active'
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Endpoint registered/updated',
      data: endpoint 
    });

  } catch (error) {
    console.error('Error registering endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to register endpoint',
      error: error.message 
    });
  }
};

/**
 * GET /api/endpoints
 * List all endpoints with optional filters
 */
exports.getEndpoints = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const endpoints = await Endpoint.find(query)
      .sort({ lastSeen: -1 } );

    // Calculate some stats
    const activeCount = await Endpoint.countDocuments({ status: 'active' });
    const inactiveCount = await Endpoint.countDocuments({ status: 'inactive' });

    res.status(200).json({ 
      success: true, 
      data: endpoints,
      stats: {
        total: endpoints.length,
        active: activeCount,
        inactive: inactiveCount
      }
    });

  } catch (error) {
    console.error('Error fetching endpoints:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch endpoints',
      error: error.message 
    });
  }
};

/**
 * GET /api/endpoints/:deviceId
 * Get a specific endpoint by device ID
 */
exports.getEndpointById = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const endpoint = await Endpoint.findOne({ deviceId });

    if (!endpoint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Endpoint not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: endpoint 
    });

  } catch (error) {
    console.error('Error fetching endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch endpoint',
      error: error.message 
    });
  }
};

/**
 * PUT /api/endpoints/:deviceId/status
 * Update endpoint status (activate/deactivate)
 */
exports.updateEndpointStatus = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be "active" or "inactive"' 
      });
    }

    const endpoint = await Endpoint.findOneAndUpdate(
      { deviceId },
      { status, lastSeen: new Date() },
      { new: true }
    );

    if (!endpoint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Endpoint not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `Endpoint marked as ${status}`,
      data: endpoint 
    });

  } catch (error) {
    console.error('Error updating endpoint status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update endpoint status',
      error: error.message 
    });
  }
};
