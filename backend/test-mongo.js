/**
 * MongoDB Connection Test Script
 * Run this to verify your MongoDB Atlas credentials
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║   MongoDB Atlas Connection Test                           ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('Testing connection with:');
console.log(`Username: ${process.env.MONGODB_URI.split('://')[1].split(':')[0]}`);
console.log(`Cluster: cluster0.lylf9rk.mongodb.net`);
console.log(`Database: firewallDB\n`);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ SUCCESS! MongoDB Connected!\n');
    console.log('Connection Details:');
    console.log(`  Host: ${mongoose.connection.host}`);
    console.log(`  Database: ${mongoose.connection.name}`);
    console.log(`  State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log('\n🎉 Your MongoDB Atlas is working perfectly!\n');
    
    // Close connection
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ FAILED! Connection Error\n');
    console.log('Error Details:');
    console.log(`  Message: ${error.message}`);
    console.log(`  Name: ${error.name}\n`);
    
    if (error.message.includes('bad auth')) {
      console.log('🔧 SOLUTION:');
      console.log('  1. Username or password is incorrect');
      console.log('  2. Go to: https://cloud.mongodb.com/');
      console.log('  3. Database Access → Edit your user');
      console.log('  4. Reset password to something simple (e.g., "TestPass123")');
      console.log('  5. Update .env file with new password');
      console.log('  6. Run this script again\n');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('🔧 SOLUTION:');
      console.log('  Connection string format is wrong');
      console.log('  Check for typos in cluster name\n');
    } else if (error.message.includes('timeout')) {
      console.log('🔧 SOLUTION:');
      console.log('  1. IP address not whitelisted');
      console.log('  2. Go to: https://cloud.mongodb.com/');
      console.log('  3. Network Access → Add IP Address');
      console.log('  4. Add: 0.0.0.0/0 (allow from anywhere)');
      console.log('  5. Wait 2-3 minutes');
      console.log('  6. Try again\n');
    }
    
    mongoose.connection.close();
    process.exit(1);
  });
