const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

/**
 * @route   POST /api/logs
 * @desc    Receive logs from endpoint agent
 * @access  Public (MVP - can add auth later)
 */
router.post('/', (req, res) => {
  // Attach socket.io to request for real-time emission
  req.io = req.app.get('io');
  logController.receiveLogs(req, res);
});

/**
 * @route   GET /api/logs
 * @desc    Fetch logs with optional filters
 * @access  Public
 */
router.get('/', logController.getLogs);

/**
 * @route   GET /api/logs/stats
 * @desc    Get log statistics for dashboard
 * @access  Public
 */
router.get('/stats', logController.getLogStats);

module.exports = router;
