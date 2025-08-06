// scanner-software.js
// Simple barcode scanner software that forwards scans to the backend API

const readline = require('readline');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/scanner/scan';

// Create readline interface for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Barcode Scanner Software');
console.log('==========================');
console.log('📡 API Endpoint:', API_URL);
console.log('📋 Format: MAPH + UserID (e.g., MAPH60432)');
console.log('⏹️  Press Ctrl+C to exit');
console.log('');

// Function to send barcode to API
async function sendBarcodeToAPI(barcode) {
  try {
    console.log(`📤 Sending barcode: ${barcode}`);
    
    const response = await axios.post(API_URL, {
      barcode: barcode
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log(`✅ SUCCESS: ${response.data.message}`);
    } else {
      console.log(`❌ ERROR: ${response.data.message}`);
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ API ERROR: ${error.response.data.message || error.response.statusText}`);
    } else {
      console.log(`❌ NETWORK ERROR: ${error.message}`);
    }
  }
}

// Function to validate barcode format
function validateBarcode(barcode) {
  if (!barcode || barcode.trim() === '') {
    console.log('❌ Empty barcode');
    return false;
  }
  
  if (!barcode.startsWith('MAPH')) {
    console.log('❌ Invalid format: Barcode must start with MAPH');
    return false;
  }
  
  if (barcode.length < 5) {
    console.log('❌ Invalid format: Barcode too short');
    return false;
  }
  
  return true;
}

// Main loop
function startScanning() {
  rl.question('🔍 Scan barcode or type manually: ', async (input) => {
    const barcode = input.trim();
    
    if (barcode.toLowerCase() === 'exit' || barcode.toLowerCase() === 'quit') {
      console.log('👋 Goodbye!');
      rl.close();
      return;
    }
    
    if (validateBarcode(barcode)) {
      await sendBarcodeToAPI(barcode);
    }
    
    // Continue scanning
    startScanning();
  });
}

// Handle Ctrl+C
rl.on('SIGINT', () => {
  console.log('\n👋 Scanner stopped. Goodbye!');
  rl.close();
  process.exit(0);
});

// Start the scanner
console.log('🚀 Scanner ready! Start scanning...\n');
startScanning(); 