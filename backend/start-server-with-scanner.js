// start-server-with-scanner.js
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting School Mobile App Backend with Scanner...');

// Start the main server
const serverProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Wait a moment for server to start, then start scanner
setTimeout(() => {
  console.log('🔍 Starting barcode scanner software...');
  const scannerProcess = spawn('node', ['scanner-software.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  scannerProcess.on('error', (error) => {
    console.error('❌ Failed to start scanner software:', error.message);
  });
  
  scannerProcess.on('exit', (code) => {
    if (code !== 0) {
      console.log(`⚠️ Scanner software exited with code ${code}`);
    }
  });
  
  // Handle scanner process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down scanner...');
    scannerProcess.kill();
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down scanner...');
    scannerProcess.kill();
  });
}, 2000); // Wait 2 seconds for server to start

// Handle server process termination
serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.log(`⚠️ Server exited with code ${code}`);
  }
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill();
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill();
});
