# Firebase Firestore Setup Guide

## 1. Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to "Firestore Database" in the left sidebar
4. Click "Create database"
5. Choose "Start in test mode" (for development)
6. Select a location (choose closest to your users)
7. Click "Done"

## 2. Configure Firestore Security Rules

In the Firestore Database section:

1. Go to "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Test collection for debugging
    match /test/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

## 3. Test Firestore Connection

1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/api/test-firestore`
3. You should see a success response if Firestore is working

## 4. Debug Authentication

The app now includes a debug panel (bottom-right corner) that shows:
- Authentication loading state
- User login status
- User details (name, email, role, ID)

## 5. Expected User Flow

1. **Google Sign-in**:
   - Click "Continue with Google"
   - Redirects to Google OAuth
   - Returns to your app
   - User profile created in Firestore
   - User redirected based on role

2. **Email/Password Registration**:
   - Fill registration form
   - Select role (Entrepreneur/Mentor/Admin)
   - Account created in Firebase Auth
   - User profile created in Firestore
   - User redirected based on role

## 6. Troubleshooting

### If Google sign-in keeps redirecting to login page:
- Check browser console for errors
- Verify Firebase project configuration
- Ensure Google OAuth is enabled in Firebase Console
- Check that your domain is authorized

### If Firestore is not updating:
- Check Firestore security rules
- Verify Firestore is enabled in Firebase Console
- Check browser console for Firestore errors
- Test the `/api/test-firestore` endpoint

### If user data is not loading:
- Check the debug panel (bottom-right)
- Verify user exists in Firestore
- Check browser console for errors
- Ensure Firestore rules allow user access

## 7. Database Structure

The app creates the following Firestore structure:

```
/users/{userId}
  - id: string
  - name: string
  - email: string
  - photoURL: string (optional)
  - role: 'entrepreneur' | 'mentor' | 'admin'
  - createdAt: timestamp
  - updatedAt: timestamp
  - lastLogin: timestamp
```

## 8. Role-Based Access

- **Entrepreneur**: Default role, can access home, storyboard, about
- **Mentor**: Can only access mentor dashboard
- **Admin**: Can only access analytics page

Users are automatically redirected to their appropriate dashboard after login.
