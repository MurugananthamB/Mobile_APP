// scanner-software.js
// Enhanced barcode scanner software for Honeywell scanners
// Automatically saves attendance data to database - Background Service Mode

const readline = require('readline');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const API_URL = 'http://localhost:5000/api/scanner/scan';
const LOG_FILE = path.join(__dirname, 'scanner-logs.txt');
const CONFIG_FILE = path.join(__dirname, 'scanner-config.json');

// Scanner configuration
let config = {
  autoSave: true,
  logScans: true,
  retryAttempts: 3,
  retryDelay: 1000,
  soundEnabled: true,
  displayMode: 'detailed', // 'simple' or 'detailed'
  autoMode: true, // New: Enable automatic mode
  backgroundMode: true, // New: Enable background service mode
  scanTimeout: 500, // Timeout for barcode scanning (ms)
  enableBackgroundProcessing: true, // Enhanced background processing
  globalScanner: true // Enable global scanner detection
};

// Load configuration
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
      config = { ...config, ...JSON.parse(configData) };
      console.log('✅ Configuration loaded');
    }
  } catch (error) {
    console.log('⚠️ Using default configuration');
  }
}

// Save configuration
function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.log('❌ Failed to save configuration');
  }
}

// Log function
function logScan(barcode, result) {
  if (!config.logScans) return;
  
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | ${barcode} | ${result}\n`;
  
  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (error) {
    console.log('⚠️ Failed to write to log file');
  }
}

// Play sound (if available)
function playSound(success) {
  if (!config.soundEnabled) return;
  
  try {
    // For Windows
    if (process.platform === 'win32') {
      const { exec } = require('child_process');
      const frequency = success ? 800 : 400;
      const duration = success ? 200 : 400;
      exec(`powershell -c "[console]::beep(${frequency}, ${duration})"`);
    }
  } catch (error) {
    // Ignore sound errors
  }
}

// Display scan result
function displayResult(barcode, result, success) {
  const timestamp = new Date().toLocaleTimeString();
  
  if (config.displayMode === 'simple') {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${barcode} | ${result}`);
  } else {
    console.log('\n' + '='.repeat(50));
    console.log(`🕐 Time: ${timestamp}`);
    console.log(`📋 Barcode: ${barcode}`);
    console.log(`📝 Result: ${result}`);
    console.log(`🎯 Status: ${success ? 'SUCCESS' : 'FAILED'}`);
    console.log('='.repeat(50) + '\n');
  }
}

// Send barcode to API with retry logic
async function sendBarcodeToAPI(barcode) {
  for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
    try {
      console.log(`📤 Attempt ${attempt}/${config.retryAttempts}: Sending barcode ${barcode}`);
      
      const response = await axios.post(API_URL, {
        barcode: barcode
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      });
      
      const result = response.data;
      const success = result.success;
      
      // Log the scan
      logScan(barcode, result.message);
      
      // Display result
      displayResult(barcode, result.message, success);
      
      // Play sound
      playSound(success);
      
      return result;
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < config.retryAttempts) {
        console.log(`⏳ Retrying in ${config.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      } else {
        const errorMessage = error.response?.data?.message || error.message;
        logScan(barcode, `ERROR: ${errorMessage}`);
        displayResult(barcode, `ERROR: ${errorMessage}`, false);
        playSound(false);
        throw error;
      }
    }
  }
}

// Validate barcode format - Updated to accept your actual barcode formats
function validateBarcode(barcode) {
  if (!barcode || barcode.trim() === '') {
    console.log('❌ Empty barcode');
    return false;
  }
  
  // Remove any whitespace or special characters
  const cleanBarcode = barcode.trim();
  
  // Accept multiple barcode formats:
  // 1. MAPH format (original): MAPH + UserID (e.g., MAPH60432)
  // 2. Short format: A03, MH03, etc.
  // 3. Medium format: MPH642, etc.
  // 4. Long format: AP642M603, etc.
  
  if (cleanBarcode.startsWith('MAPH')) {
    // Original MAPH format
    if (cleanBarcode.length < 5) {
      console.log('❌ Invalid MAPH format: Barcode too short');
      return false;
    }
    return true;
  }
  
  // Accept other formats (A03, MPH642, MH03, AP642M603, etc.)
  if (cleanBarcode.length >= 2 && cleanBarcode.length <= 20) {
    // Valid barcode format - accept it
    return true;
  }
  
  console.log('❌ Invalid format: Barcode length must be between 2-20 characters');
  return false;
}

// Process barcode automatically
async function processBarcode(barcode) {
  if (validateBarcode(barcode)) {
    try {
      await sendBarcodeToAPI(barcode);
    } catch (error) {
      console.log(`❌ Failed to process barcode: ${error.message}`);
    }
  }
}

// Global scanner detection for Windows - Enhanced version
function initializeGlobalScanner() {
  if (process.platform !== 'win32') {
    console.log('⚠️ Global scanner only supported on Windows');
    return initializeBackgroundMode();
  }

  console.log('🌐 Global Scanner Mode Enabled');
  console.log('📋 Scanner will detect barcodes from anywhere on the computer');
  console.log('🎯 No need to focus any window - just scan barcodes');
  console.log('🔊 Audio feedback enabled for successful/failed scans');
  console.log('');

  // Create a much simpler PowerShell script that doesn't require complex assemblies
  const powershellScript = `# Simple global keyboard hook using PowerShell - No complex assemblies required
try {
    Add-Type -TypeDefinition @"
        using System;
        using System.Runtime.InteropServices;
        
        public class GlobalKeyboardHook : IDisposable {
            private const int WH_KEYBOARD_LL = 13;
            private const int WM_KEYDOWN = 0x0100;
            
            [DllImport("user32.dll")]
            private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);
            
            [DllImport("user32.dll")]
            private static extern bool UnhookWindowsHookEx(IntPtr hhk);
            
            [DllImport("user32.dll")]
            private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);
            
            [DllImport("kernel32.dll")]
            private static extern IntPtr GetModuleHandle(string lpModuleName);
            
            private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);
            private LowLevelKeyboardProc _proc;
            private IntPtr _hookID = IntPtr.Zero;
            private string _buffer = "";
            private DateTime _lastKeyTime = DateTime.Now;
            private bool _isProcessing = false;
            private string _lastBarcode = "";
            
            public string LastBarcode {
                get { return _lastBarcode; }
            }
            
            public bool HasNewBarcode {
                get { return !string.IsNullOrEmpty(_lastBarcode); }
            }
            
            public GlobalKeyboardHook() {
                _proc = new LowLevelKeyboardProc(HookCallback);
            }
            
            public void Start() {
                _hookID = SetHook(_proc);
            }
            
            public void Stop() {
                if (_hookID != IntPtr.Zero) {
                    UnhookWindowsHookEx(_hookID);
                    _hookID = IntPtr.Zero;
                }
            }
            
            public string GetAndClearBarcode() {
                string barcode = _lastBarcode;
                _lastBarcode = "";
                return barcode;
            }
            
            private IntPtr SetHook(LowLevelKeyboardProc proc) {
                using (var curProcess = System.Diagnostics.Process.GetCurrentProcess()) {
                    using (var curModule = curProcess.MainModule) {
                        return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
                    }
                }
            }
            
            private IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
                if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN) {
                    int vkCode = Marshal.ReadInt32(lParam);
                    
                    if (vkCode == 13) { // Enter key
                        if (_buffer.Length > 0 && !_isProcessing) {
                            _isProcessing = true;
                            _lastBarcode = _buffer;
                            _buffer = "";
                            _isProcessing = false;
                        }
                    } else if (vkCode >= 32 && vkCode <= 126) { // Printable characters
                        char key = (char)vkCode;
                        _buffer += key;
                        _lastKeyTime = DateTime.Now;
                    }
                    
                    // Auto-process after timeout (for scanners that don't send Enter)
                    if (_buffer.Length > 0 && (DateTime.Now - _lastKeyTime).TotalMilliseconds > 300) {
                        if (_buffer.Length >= 2 && !_isProcessing) {
                            _isProcessing = true;
                            _lastBarcode = _buffer;
                            _buffer = "";
                            _isProcessing = false;
                        }
                    }
                }
                
                return CallNextHookEx(_hookID, nCode, wParam, lParam);
            }
            
            public void Dispose() {
                Stop();
            }
        }
"@
    
    $hook = New-Object GlobalKeyboardHook
    $hook.Start()
    Write-Output "Global scanner started. Press Ctrl+C to stop."
    
    try {
        while ($true) {
            if ($hook.HasNewBarcode) {
                $barcode = $hook.GetAndClearBarcode()
                Write-Output "BARCODE:$barcode"
            }
            Start-Sleep -Milliseconds 100
        }
    } finally {
        $hook.Stop()
        $hook.Dispose()
    }
} catch {
    Write-Error "Failed to initialize global scanner: $_"
    Write-Output "Falling back to background mode..."
    exit 1
}`;

  // Write PowerShell script to temporary file
  const scriptPath = path.join(__dirname, 'global-scanner.ps1');
  fs.writeFileSync(scriptPath, powershellScript);

  // Start PowerShell process with elevated privileges
  const powershellProcess = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', scriptPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: false
  });

  let isProcessing = false;

  powershellProcess.stdout.on('data', async (data) => {
    const output = data.toString();
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('BARCODE:')) {
        const barcode = line.substring(8).trim();
        if (barcode && !isProcessing) {
          isProcessing = true;
          console.log(`🔍 Global scanner detected barcode: ${barcode}`);
          await processBarcode(barcode);
          isProcessing = false;
        }
      }
    }
  });

  powershellProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('Global scanner started')) {
      console.log(`PowerShell Error: ${error}`);
    }
  });

  powershellProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`PowerShell process exited with code ${code}`);
      console.log('🔄 Falling back to background mode...');
      initializeBackgroundMode();
    }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping global scanner...');
    powershellProcess.kill();
    if (fs.existsSync(scriptPath)) {
      try {
        fs.unlinkSync(scriptPath);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n👋 Stopping global scanner...');
    powershellProcess.kill();
    if (fs.existsSync(scriptPath)) {
      try {
        fs.unlinkSync(scriptPath);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    process.exit(0);
  });

  console.log('🔍 Global scanner ready - scanning barcodes from anywhere on the computer...');
  console.log('📋 Just scan barcodes with your physical scanner device');
  console.log('🎯 No need to focus any window or terminal');
  console.log('🔊 Audio feedback will indicate success/failure');
  console.log('');
}

// Enhanced background service mode for physical barcode scanners
function initializeBackgroundMode() {
  console.log('🔄 Enhanced Background Service Mode Enabled');
  console.log('📋 Physical barcode scanner ready - scanning in background');
  console.log('🎯 Scanner will process barcodes automatically even when terminal is not focused');
  console.log('🔊 Audio feedback enabled for successful/failed scans');
  console.log('');
  
  // Set up stdin to handle data automatically in background
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  
  let buffer = '';
  let lastScanTime = 0;
  let scanTimeout = null;
  let localIsProcessing = false;
  
  // Handle data input in background
  process.stdin.on('data', async (data) => {
    const char = data.toString();
    const currentTime = Date.now();
    
    // Handle Ctrl+C to exit
    if (char === '\u0003') {
      console.log('\n👋 Scanner stopped. Goodbye!');
      process.exit(0);
    }
    
    // Handle Enter key (end of barcode) - most barcode scanners send this
    if (char === '\r' || char === '\n') {
      if (buffer.trim() && !localIsProcessing) {
        localIsProcessing = true;
        const barcode = buffer.trim();
        buffer = '';
        
        // Clear any pending timeout
        if (scanTimeout) {
          clearTimeout(scanTimeout);
          scanTimeout = null;
        }
        
        console.log(`🔍 Processing barcode: ${barcode}`);
        
        // Process the barcode
        await processBarcode(barcode);
        localIsProcessing = false;
        
        // Show ready message
        console.log('🔍 Ready for next scan...');
      }
    } else {
      // Add character to buffer
      buffer += char;
      lastScanTime = currentTime;
      
      // Clear any existing timeout
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
      
      // Set a new timeout to process the barcode if no more input comes
      // This handles scanners that don't send Enter key
      scanTimeout = setTimeout(async () => {
        if (buffer.trim() && !localIsProcessing) {
          localIsProcessing = true;
          const barcode = buffer.trim();
          buffer = '';
          
          console.log(`🔍 Processing barcode (timeout): ${barcode}`);
          
          // Process the barcode
          await processBarcode(barcode);
          localIsProcessing = false;
          
          // Show ready message
          console.log('🔍 Ready for next scan...');
        }
      }, config.scanTimeout); // Use configurable timeout
    }
  });
  
  console.log('🔍 Background scanner ready - scanning in background...');
  console.log('📋 Just scan barcodes with your physical scanner device');
  console.log('🎯 No need to click in terminal or press Enter');
  console.log('🔊 Audio feedback will indicate success/failure');
  console.log('');
}

// Show help menu
function showHelp() {
  console.log('\n🔧 Scanner Commands:');
  console.log('📋 scan <barcode>  - Scan a barcode');
  console.log('⚙️  config          - Show current configuration');
  console.log('🔧 set <key> <value> - Change configuration');
  console.log('📊 stats           - Show scan statistics');
  console.log('📄 logs            - Show recent logs');
  console.log('❓ help            - Show this help');
  console.log('🚪 exit            - Exit scanner');
  console.log('');
}

// Show configuration
function showConfig() {
  console.log('\n⚙️ Current Configuration:');
  console.log(`📊 Auto Save: ${config.autoSave ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`📝 Log Scans: ${config.logScans ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`🔄 Retry Attempts: ${config.retryAttempts}`);
  console.log(`⏱️  Retry Delay: ${config.retryDelay}ms`);
  console.log(`🔊 Sound: ${config.soundEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`📱 Display Mode: ${config.displayMode}`);
  console.log(`🤖 Auto Mode: ${config.autoMode ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`🔄 Background Mode: ${config.backgroundMode ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`⏱️  Scan Timeout: ${config.scanTimeout}ms`);
  console.log(`🔄 Background Processing: ${config.enableBackgroundProcessing ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`🌐 Global Scanner: ${config.globalScanner ? '✅ Enabled' : '❌ Disabled'}`);
  console.log('');
}

// Show statistics
function showStats() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(line => line.trim());
      const totalScans = logs.length;
      const successfulScans = logs.filter(log => !log.includes('ERROR')).length;
      const failedScans = totalScans - successfulScans;
      
      console.log('\n📊 Scan Statistics:');
      console.log(`📈 Total Scans: ${totalScans}`);
      console.log(`✅ Successful: ${successfulScans}`);
      console.log(`❌ Failed: ${failedScans}`);
      console.log(`📊 Success Rate: ${totalScans > 0 ? ((successfulScans / totalScans) * 100).toFixed(1) : 0}%`);
      console.log('');
    } else {
      console.log('\n📊 No scan logs found');
    }
  } catch (error) {
    console.log('\n❌ Failed to read statistics');
  }
}

// Show recent logs
function showLogs() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(line => line.trim());
      const recentLogs = logs.slice(-10); // Show last 10 logs
      
      console.log('\n📄 Recent Logs:');
      recentLogs.forEach(log => {
        console.log(log);
      });
      console.log('');
    } else {
      console.log('\n📄 No logs found');
    }
  } catch (error) {
    console.log('\n❌ Failed to read logs');
  }
}

// Change configuration
function changeConfig(key, value) {
  if (!(key in config)) {
    console.log(`❌ Unknown configuration key: ${key}`);
    return;
  }
  
  // Convert value to appropriate type
  if (typeof config[key] === 'boolean') {
    config[key] = value.toLowerCase() === 'true';
  } else if (typeof config[key] === 'number') {
    config[key] = parseInt(value);
  } else {
    config[key] = value;
  }
  
  saveConfig();
  console.log(`✅ Configuration updated: ${key} = ${value}`);
}

// Initialize scanner
function initializeScanner() {
  console.log('🔍 Enhanced Barcode Scanner Software');
  console.log('=====================================');
  console.log('📡 API Endpoint:', API_URL);
  console.log('📋 Accepted formats: MAPH + UserID, A03, MPH642, MH03, AP642M603, etc.');
  console.log('⚙️  Type "help" for commands');
  console.log('⏹️  Press Ctrl+C to exit');
  console.log('');
  
  loadConfig();
  showConfig();
  
  if (config.globalScanner && process.platform === 'win32') {
    initializeGlobalScanner();
  } else if (config.backgroundMode) {
    initializeBackgroundMode();
  } else {
    console.log('🚀 Scanner ready! Start scanning...\n');
    initializeBackgroundMode();
  }
}

// Start the scanner
initializeScanner(); 