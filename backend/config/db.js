const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('\n🔧 Connecting to MongoDB Atlas...');
    console.log(`   Connection String: ${process.env.MONGODB_URI ? 'Present ✅' : 'Missing ❌'}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('\n✅ MongoDB Connected Successfully!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);
  } catch (error) {
    console.error('\n❌ Error connecting to MongoDB:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check username/password in MongoDB Atlas');
    console.error('   2. Verify Network Access allows your IP (0.0.0.0/0)');
    console.error('   3. Ensure .env file has correct MONGODB_URI\n');
    process.exit(1);
  }
};

module.exports = connectDB;
