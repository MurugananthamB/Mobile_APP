# Simple global keyboard hook using PowerShell - No complex assemblies required
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
}