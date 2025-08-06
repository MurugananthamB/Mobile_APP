# Web Interface Setup Guide

## 🎯 **Option 1: Web Interface (Recommended)**

This is the easiest way to get your barcode scanner working!

### **Step 1: Start Your Backend Server**

```bash
cd backend
npm start
```

### **Step 2: Open the Web Interface**

1. **Open your web browser**
2. **Go to**: http://localhost:5000/scanner.html
3. **You should see** a clean interface with an input field

### **Step 3: Configure Your Barcode Scanner**

**For USB Scanners:**
1. **Connect your scanner** to your computer
2. **Open the web page**: http://localhost:5000/scanner.html
3. **Click in the input field** to focus it
4. **Point your scanner** at the input field
5. **Scan a barcode** - it will automatically submit

**For Network/Bluetooth Scanners:**
1. **Configure your scanner** to send HTTP POST requests
2. **Set the URL**: `http://localhost:5000/api/scanner/scan`
3. **Set Method**: POST
4. **Set Headers**: `Content-Type: application/json`
5. **Set Body**: `{"barcode": "SCANNED_DATA"}`

### **Step 4: Test the System**

1. **Type a test barcode**: MAPH60432
2. **Press Enter**
3. **Check the response** - you should see:
   - ✅ **SUCCESS**: Attendance marked as Full Day Present for user Aadarsh.

### **Step 5: Use with Real Scanner**

1. **Point your scanner** at the input field
2. **Scan any barcode** with MAPH prefix
3. **The page will automatically**:
   - Send the barcode to the backend
   - Show success/error message
   - Clear the field for the next scan

## 🔧 **How It Works**

### **Web Interface Features:**
- ✅ **Receives barcode input** from any scanner
- ✅ **Auto-submits** when Enter is pressed
- ✅ **Shows real-time feedback**
- ✅ **Clears field** after each scan
- ✅ **Works with any scanner** that outputs to text

### **Backend API Features:**
- ✅ **Validates barcode format** (must start with MAPH)
- ✅ **Finds users** in database
- ✅ **Marks attendance** based on scan time
- ✅ **Stores in database**
- ✅ **Prevents duplicate scans**

## 📊 **Time Windows**

The system marks attendance based on scan time:

- **8:00 AM - 9:30 AM**: Half Day Present (Morning)
- **12:30 PM - 2:00 PM**: Half Day Present (Afternoon)  
- **3:30 PM - 7:00 PM**: Full Day Present
- **Outside these windows**: Scan recorded but no attendance marked

## 🛠️ **Troubleshooting**

### **Scanner not working:**
1. **Check if backend server is running**: `npm start`
2. **Check if web page loads**: http://localhost:5000/scanner.html
3. **Try typing manually** first to test
4. **Check scanner connection** and drivers

### **"User not found" errors:**
1. **Verify user exists** in database
2. **Check barcode format** (must start with MAPH)
3. **Test with known barcode**: MAPH60432

### **"Outside valid time windows":**
1. **Check current time**
2. **Scan during valid time windows**
3. **Or modify time windows** in code if needed

## ✅ **Success Indicators**

When working correctly, you should see:
- ✅ Web page loads without errors
- ✅ Backend server is running
- ✅ Barcode scans show success messages
- ✅ Attendance appears in database
- ✅ No "User not found" errors for valid users

## 🎉 **You're Ready!**

Your barcode scanner system is now fully functional using the web interface. Any barcode scanner that can output to a text field will work with this setup! 