const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @route   GET /api/test-db
 * @desc    Test database connection by inserting and retrieving data
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'MongoDB is not connected',
        readyState: mongoose.connection.readyState
      });
    }

    // Create a test schema and model (only in memory, not saved permanently)
    const testSchema = new mongoose.Schema({
      message: String,
      timestamp: { type: Date, default: Date.now }
    });

    const TestModel = mongoose.model('TestConnection', testSchema);

    // Insert a test document
    const testDoc = await TestModel.create({
      message: 'MongoDB Atlas connection test successful!',
      timestamp: new Date()
    });

    // Retrieve it back
    const retrievedDoc = await TestModel.findById(testDoc._id);

    // Clean up - delete the test document
    await TestModel.deleteOne({ _id: testDoc._id });

    // Return success with connection details
    res.json({
      success: true,
      message: '✅ MongoDB Atlas connection working perfectly!',
      connection: {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
        readyStateText: 'Connected'
      },
      testDocument: {
        inserted: testDoc.message,
        retrieved: retrievedDoc.message,
        timestamp: testDoc.timestamp
      }
    });

  } catch (error) {
    console.error('Test DB Error:', error);
    res.status(500).json({
      success: false,
      message: '❌ Database test failed',
      error: error.message
    });
  }
});

module.exports = router;
