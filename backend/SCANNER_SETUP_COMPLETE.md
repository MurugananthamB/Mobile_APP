# Barcode Scanner Setup Guide

## 🎯 **Overview**
This system allows barcode scanners to directly mark attendance without requiring any test pages or web interfaces. The scanner hardware sends HTTP requests directly to the backend API.

## 📋 **Setup Options**

### **Option 1: Use the Scanner Software (Recommended)**

1. **Start the scanner software**:
   ```bash
   cd backend
   node scanner-software.js
   ```

2. **Or use the batch file** (Windows):
   - Double-click `start-scanner.bat`
   - Or run: `start-scanner.bat`

3. **Scan barcodes**:
   - The software will prompt you to scan
   - Type or scan any barcode with MAPH prefix
   - It will automatically send to the backend API

### **Option 2: Configure Your Hardware Scanner**

If you have a network-enabled barcode scanner:

1. **Access scanner settings** (web interface or mobile app)
2. **Configure HTTP POST**:
   - **URL**: `http://localhost:5000/api/scanner/scan`
   - **Method**: POST
   - **Headers**: `Content-Type: application/json`
   - **Body**: `{"barcode": "SCANNED_DATA"}`

### **Option 3: Use Mobile App Scanner**

1. **Install a barcode scanner app** that supports HTTP POST
2. **Configure the app** to send requests to your API
3. **Set the endpoint**: `http://localhost:5000/api/scanner/scan`

## 🔧 **How It Works**

### **Scanner Software Features**:
- ✅ **Receives barcode input** (manual typing or scanner)
- ✅ **Validates format** (must start with MAPH)
- ✅ **Sends HTTP POST** to your backend API
- ✅ **Shows success/error messages**
- ✅ **Continuous scanning** (no need to restart)

### **Backend API Features**:
- ✅ **Accepts any MAPH barcode** (dynamic)
- ✅ **Time-based attendance logic**
- ✅ **Stores in database**
- ✅ **Prevents duplicate scans**
- ✅ **Detailed logging**

## 📊 **Time Windows for Attendance**

The system marks attendance based on scan time:

- **8:00 AM - 9:30 AM**: Half Day Present (Morning)
- **12:30 PM - 2:00 PM**: Half Day Present (Afternoon)  
- **3:30 PM - 7:00 PM**: Full Day Present
- **Outside these windows**: Scan recorded but no attendance marked

## 🚀 **Quick Start**

1. **Start your backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start the scanner software**:
   ```bash
   node scanner-software.js
   ```

3. **Scan a barcode** (e.g., MAPH60432)

4. **Check the response** - you'll see success/error messages

## 🔍 **Testing**

### **Test with known barcodes**:
- `MAPH60432` (should work if user exists)
- `MAPH60354` (should work if user exists)
- `MAPH2024001` (will show "User not found" if user doesn't exist)

### **Test with invalid barcodes**:
- `123456` (will show "Invalid format")
- `ABC123` (will show "Invalid format")
- Empty scan (will show "Empty barcode")

## 📝 **Logs and Debugging**

### **Scanner Software Logs**:
- Shows what barcode was scanned
- Shows API response
- Shows success/error messages

### **Backend Server Logs**:
- Shows incoming requests
- Shows time window calculations
- Shows database operations
- Shows attendance status decisions

## 🛠️ **Troubleshooting**

### **Scanner not working**:
1. Check if backend server is running
2. Check if scanner software is running
3. Verify barcode format (must start with MAPH)
4. Check network connectivity

### **"User not found" errors**:
1. Verify user exists in database
2. Check userid field matches barcode
3. Ensure barcode format is correct

### **"Outside valid time windows"**:
1. Check current time
2. Scan during valid time windows
3. Or modify time windows in code if needed

## 📱 **For Production**

### **Change localhost to your server IP**:
1. Update `API_URL` in `scanner-software.js`
2. Update scanner configuration
3. Use HTTPS for security

### **Add more users**:
1. Add users to database with correct `userid` field
2. Ensure barcode format matches userid
3. Test with new barcodes

## ✅ **Success Indicators**

When working correctly, you should see:
- ✅ Scanner software starts without errors
- ✅ Backend server is running
- ✅ Barcode scans show success messages
- ✅ Attendance appears in database
- ✅ No "User not found" errors for valid users

## 🎉 **You're All Set!**

Your barcode scanner system is now fully functional and independent. The scanner software will handle all the HTTP communication with your backend API automatically. 