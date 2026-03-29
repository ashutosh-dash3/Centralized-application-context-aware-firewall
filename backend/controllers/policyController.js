const Policy = require('../models/Policy');

/**
 * GET /api/policies/:deviceId
 * Get all policies for a specific device
 */
exports.getPoliciesByDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId is required' 
      });
    }

    const policies = await Policy.find({ deviceId, enabled: true });

    res.status(200).json({ 
      success: true, 
      data: policies 
    });

  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch policies',
      error: error.message 
    });
  }
};

/**
 * POST /api/policies
 * Create or update a policy
 */
exports.createOrUpdatePolicy = async (req, res) => {
  try {
    const { 
      deviceId, 
      appName, 
      allowedDomains, 
      blockedDomains, 
      allowedIPs, 
      blockedIPs,
      enabled,
      description 
    } = req.body;

    // Validation
    if (!deviceId || !appName) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId and appName are required' 
      });
    }

    // Find existing policy or create new one
    let policy = await Policy.findOne({ deviceId, appName });

    if (policy) {
      // Update existing policy
      policy.allowedDomains = allowedDomains !== undefined ? allowedDomains : policy.allowedDomains;
      policy.blockedDomains = blockedDomains !== undefined ? blockedDomains : policy.blockedDomains;
      policy.allowedIPs = allowedIPs !== undefined ? allowedIPs : policy.allowedIPs;
      policy.blockedIPs = blockedIPs !== undefined ? blockedIPs : policy.blockedIPs;
      policy.enabled = enabled !== undefined ? enabled : policy.enabled;
      policy.description = description !== undefined ? description : policy.description;
    } else {
      // Create new policy
      policy = new Policy({
        deviceId,
        appName,
        allowedDomains: allowedDomains || [],
        blockedDomains: blockedDomains || [],
        allowedIPs: allowedIPs || [],
        blockedIPs: blockedIPs || [],
        enabled: enabled !== undefined ? enabled : true,
        description: description || ''
      });
    }

    await policy.save();

    res.status(200).json({ 
      success: true, 
      message: policy._id ? 'Policy updated' : 'Policy created',
      data: policy 
    });

  } catch (error) {
    console.error('Error creating/updating policy:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save policy',
      error: error.message 
    });
  }
};

/**
 * DELETE /api/policies/:id
 * Delete a policy by ID
 */
exports.deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findByIdAndDelete(id);

    if (!policy) {
      return res.status(404).json({ 
        success: false, 
        message: 'Policy not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Policy deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete policy',
      error: error.message 
    });
  }
};

/**
 * GET /api/policies
 * Get all policies with optional filters
 */
exports.getAllPolicies = async (req, res) => {
  try {
    const { deviceId, appName, enabled } = req.query;
    
    const query = {};
    if (deviceId) query.deviceId = deviceId;
    if (appName) query.appName = appName;
    if (enabled !== undefined) query.enabled = enabled === 'true';

    const policies = await Policy.find(query).sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      data: policies 
    });

  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch policies',
      error: error.message 
    });
  }
};
