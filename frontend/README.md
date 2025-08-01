# School Mobile App Frontend

This is the frontend application for the School Mobile App built with React Native and Expo.

## Features

### Profile Management
- **Profile Image Upload**: Users can upload and update their profile images
  - Support for both gallery selection and camera capture
  - Image validation (5MB size limit, image format validation)
  - Real-time preview of selected images
  - Automatic image refresh after upload
  - Error handling for network issues and upload failures

### Authentication
- Login/Register functionality
- JWT token-based authentication
- Protected routes

### Other Features
- Attendance tracking
- Fee management
- Homework assignments
- Notices and events
- Results and timetable
- Hostel management

## Profile Image Upload Implementation

The profile image upload feature includes:

1. **Image Selection**: Users can choose between gallery or camera
2. **Image Validation**: File size and format validation
3. **Upload Process**: Secure upload to backend with progress indication
4. **Display**: Real-time image display with cache busting
5. **Error Handling**: Comprehensive error handling for various scenarios

### Technical Details

- **Backend Endpoint**: `/api/protected/profile/image`
- **File Storage**: Local file system with organized directory structure
- **Image Processing**: Multer middleware for file handling
- **Security**: Authentication required for upload
- **File Limits**: 5MB maximum file size
- **Supported Formats**: All common image formats (JPEG, PNG, etc.)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Backend Requirements

Make sure the backend server is running and accessible at the configured URL in `services/api.js`.

## Environment Configuration

Update the `BASE_URL` in `services/api.js` to match your backend server address.
