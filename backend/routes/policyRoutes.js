const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');

/**
 * @route   GET /api/policies/:deviceId
 * @desc    Get all policies for a specific device
 * @access  Public
 */
router.get('/:deviceId', policyController.getPoliciesByDevice);

/**
 * @route   GET /api/policies
 * @desc    Get all policies with optional filters
 * @access  Public
 */
router.get('/', policyController.getAllPolicies);

/**
 * @route   POST /api/policies
 * @desc    Create or update a policy
 * @access  Public
 */
router.post('/', policyController.createOrUpdatePolicy);

/**
 * @route   DELETE /api/policies/:id
 * @desc    Delete a policy by ID
 * @access  Public
 */
router.delete('/:id', policyController.deletePolicy);

module.exports = router;
