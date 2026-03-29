const express = require('express');
const router = express.Router();
const endpointController = require('../controllers/endpointController');

/**
 * @route   POST /api/endpoints
 * @desc    Register or update an endpoint
 * @access  Public
 */
router.post('/', endpointController.registerEndpoint);

/**
 * @route   GET /api/endpoints
 * @desc    List all endpoints with optional filters
 * @access  Public
 */
router.get('/', endpointController.getEndpoints);

/**
 * @route   GET /api/endpoints/:deviceId
 * @desc    Get a specific endpoint by device ID
 * @access  Public
 */
router.get('/:deviceId', endpointController.getEndpointById);

/**
 * @route   PUT /api/endpoints/:deviceId/status
 * @desc    Update endpoint status (activate/deactivate)
 * @access  Public
 */
router.put('/:deviceId/status', endpointController.updateEndpointStatus);

module.exports = router;
