const axios = require('axios');

const API_URL = 'http://localhost:5000/api/scanner/scan';
const testBarcodes = [
  'MAPH60432',
  'MAPH60354', 
  'MAPH60433',
  'MAPH60434',
  'MAPH60435',
  'MAPH60436',
  'MAPH60437',
  'MAPH60438',
  'MAPH60439',
  'MAPH60440'
];

async function sendScan(barcode, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const startTime = Date.now();
      try {
        const response = await axios.post(API_URL, { barcode }, {
          headers: { 'Content-Type': 'application/json' }
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (response.data.success) {
          console.log(`✅ ${barcode}: SUCCESS (${responseTime}ms) - ${response.data.message}`);
        } else {
          console.log(`❌ ${barcode}: FAILED (${responseTime}ms) - ${response.data.message}`);
        }
        resolve({ barcode, success: response.data.success, responseTime });
      } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        console.log(`❌ ${barcode}: ERROR (${responseTime}ms) - ${error.message}`);
        resolve({ barcode, success: false, responseTime });
      }
    }, delay);
  });
}

async function testConcurrentScans() {
  console.log('🚀 Testing Concurrent Barcode Scans');
  console.log('====================================');
  console.log(`📊 Testing ${testBarcodes.length} simultaneous scans...`);
  console.log('');

  const startTime = Date.now();
  
  // Send all scans simultaneously
  const promises = testBarcodes.map((barcode, index) => 
    sendScan(barcode, index * 50) // Small delay between each scan
  );
  
  const results = await Promise.all(promises);
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Calculate statistics
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgResponseTime = Math.round(
    results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
  );
  
  console.log('');
  console.log('📊 Test Results:');
  console.log('================');
  console.log(`⏱️  Total Time: ${totalTime}ms`);
  console.log(`✅ Successful: ${successful}/${testBarcodes.length}`);
  console.log(`❌ Failed: ${failed}/${testBarcodes.length}`);
  console.log(`📈 Success Rate: ${Math.round((successful / testBarcodes.length) * 100)}%`);
  console.log(`⚡ Average Response Time: ${avgResponseTime}ms`);
  console.log(`🚀 Scans per Second: ${Math.round((testBarcodes.length / totalTime) * 1000)}`);
  
  if (successful === testBarcodes.length) {
    console.log('');
    console.log('🎉 All scans successful! System is ready for high-speed scanning.');
  } else {
    console.log('');
    console.log('⚠️  Some scans failed. Check the logs above for details.');
  }
}

// Run the test
testConcurrentScans().catch(console.error); 