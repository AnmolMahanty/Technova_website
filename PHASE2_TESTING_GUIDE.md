# Phase 2: Authentication Testing Guide

This guide will walk you through testing all authentication features implemented in Phase 2.

---

## Prerequisites

✅ **Before you start:**
1. Dev server is running: `npm run dev`
2. Firebase project is configured
3. Environment variables are set in `.env`
4. Firestore security rules are deployed

---

## Test 1: User Registration (Email/Password)

### Steps:

1. **Open the application**
   - Navigate to http://localhost:5173
   - You should see a placeholder home page

2. **Navigate to Register page**
   - Click on `/register` or manually go to: http://localhost:5173/register
   - You should see the registration form

3. **Fill in the registration form**
   - **First Name**: Test
   - **Last Name**: User
   - **Phone**: 1234567890
   - **Email**: testuser@example.com (use a unique email)
   - **Password**: test123 (min 6 characters)
   - **Confirm Password**: test123

4. **Submit the form**
   - Click "Create account" button
   - Watch for loading state: "Creating account..."

### Expected Results:

✅ **Success:**
- Registration completes without errors
- You're automatically redirected to `/student/dashboard`
- You see "Student Dashboard" heading

✅ **What happens in the background:**
- Firebase Auth user created
- Firestore `users` collection has new document with:
  - `email`: testuser@example.com
  - `firstName`: Test
  - `lastName`: User
  - `phone`: 1234567890
  - `role`: student (default)
  - `createdAt`: timestamp

### Verification in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `technova-website-6f73f`
3. **Authentication** → **Users** tab
   - You should see `testuser@example.com` listed
4. **Firestore Database**
   - Go to `users` collection
   - Find the document with the user's UID
   - Verify all fields are present

---

## Test 2: User Logout

### Steps:

1. While logged in (from Test 1), refresh the page
   - You should stay logged in (AuthContext persists)
   - You should still see Student Dashboard

2. **Log out** (once logout button is implemented)
   - For now, you can test logout via browser console:
   ```javascript
   // Open browser console (F12)
   // This will be replaced with a proper logout button in Phase 3
   import { auth } from './src/utils/firebase.js';
   import { signOut } from 'firebase/auth';
   signOut(auth);
   ```

### Expected Results:

✅ **Success:**
- You're redirected to home page `/`
- Trying to access `/student/dashboard` redirects to `/login`

---

## Test 3: User Login (Email/Password)

### Steps:

1. **Navigate to Login page**
   - Go to: http://localhost:5173/login
   - You should see the login form

2. **Fill in login credentials**
   - **Email**: testuser@example.com
   - **Password**: test123

3. **Submit the form**
   - Click "Sign in" button
   - Watch for loading state: "Signing in..."

### Expected Results:

✅ **Success:**
- Login completes without errors
- You're redirected to `/student/dashboard` (because role is "student")
- You see "Student Dashboard" heading

❌ **Test failure scenarios:**
1. Wrong password → Error: "Invalid credentials"
2. Non-existent email → Error: "Invalid credentials"
3. Empty fields → Error: "Please fill in all fields"

---

## Test 4: Google Sign-In

### Steps:

1. **Navigate to Login page**
   - Go to: http://localhost:5173/login

2. **Click "Sign in with Google"**
   - Google Sign-In popup should appear
   - Select your Google account

3. **Authorize the app**
   - Click "Continue" or "Allow"

### Expected Results:

✅ **Success (New Google User):**
- Google Sign-In completes
- New user document created in Firestore `users` collection with:
  - `email`: your.google@email.com
  - `firstName`: Extracted from Google display name
  - `lastName`: Extracted from Google display name
  - `role`: student (default)
- Redirected to `/student/dashboard`

✅ **Success (Existing Google User):**
- Google Sign-In completes
- Uses existing Firestore user document
- Redirected to `/student/dashboard`

### Verification:
- Check Firestore → `users` collection for your Google email
- Verify `role: student`

---

## Test 5: Protected Routes

### Steps:

1. **Log out** (see Test 2)
2. **Try accessing protected routes directly:**

   a. Student Dashboard:
   - Go to: http://localhost:5173/student/dashboard

   b. Admin Dashboard:
   - Go to: http://localhost:5173/admin/dashboard

### Expected Results:

✅ **Success (Not Logged In):**
- Both routes redirect to `/login`
- You cannot access protected pages without authentication

---

## Test 6: Role-Based Access Control (Student)

### Steps:

1. **Log in as student** (use testuser@example.com)
2. **Try accessing admin dashboard:**
   - Go to: http://localhost:5173/admin/dashboard

### Expected Results:

✅ **Success:**
- You're redirected to `/` (home page)
- Students cannot access admin routes

✅ **Can access:**
- Student dashboard: `/student/dashboard` ✅ Works

❌ **Cannot access:**
- Admin dashboard: `/admin/dashboard` ❌ Redirects to home

---

## Test 7: Manual Admin Promotion

To test admin functionality, you need to manually promote a user to admin role.

### Steps:

1. **Create a test admin account**
   - Register a new account: admin@example.com (password: admin123)
   - Log in to verify it works

2. **Promote to admin in Firestore:**

   a. Go to [Firebase Console](https://console.firebase.google.com/)
   
   b. Select project: `technova-website-6f73f`
   
   c. Go to **Firestore Database**
   
   d. Navigate to `users` collection
   
   e. Find the document for `admin@example.com`
      - Click on the document
   
   f. **Edit the `role` field:**
      - Current value: `student`
      - New value: `admin`
      - Click **Update**

3. **Log out and log back in**
   - This refreshes the role in AuthContext

### Expected Results:

✅ **Success:**
- User role updated in Firestore
- After re-login, AuthContext detects `role: admin`

---

## Test 8: Role-Based Access Control (Admin)

### Steps:

1. **Log in as admin** (admin@example.com)

2. **Check role-based redirect:**
   - After login, you should be redirected to `/admin/dashboard` (not student dashboard)

3. **Test admin access:**
   - Admin Dashboard: http://localhost:5173/admin/dashboard
   - ✅ Should load successfully

4. **Test student route access:**
   - Student Dashboard: http://localhost:5173/student/dashboard
   - ✅ Should also load (admins can access student routes)

### Expected Results:

✅ **Success:**
- Admin users redirect to `/admin/dashboard` on login
- Admins can access both admin and student routes
- Students can only access student routes

---

## Test 9: Password Validation

### Steps:

1. **Navigate to Register page**
2. **Test short password:**
   - Fill in all fields
   - Password: `12345` (only 5 characters)
   - Confirm Password: `12345`
   - Click "Create account"

### Expected Results:

❌ **Error:** "Password must be at least 6 characters"

### Test password mismatch:
   - Password: `test123`
   - Confirm Password: `test456`
   - Click "Create account"

### Expected Results:

❌ **Error:** "Passwords do not match"

---

## Test 10: Form Validation

### Steps:

1. **Navigate to Register page**
2. **Try submitting with empty fields:**
   - Leave fields blank
   - Click "Create account"

### Expected Results:

❌ **Error:** "Please fill in all fields"

### Test email validation:
   - Email: `invalidemail` (no @ symbol)
   - Browser should show HTML5 validation error

---

## Test 11: Auth State Persistence

### Steps:

1. **Log in** (any user)
2. **Refresh the page**
3. **Close and reopen the browser**

### Expected Results:

✅ **Success:**
- You remain logged in after refresh
- You remain logged in after reopening browser
- Firebase Auth persists session automatically

---

## Common Issues & Troubleshooting

### Issue 1: "Firebase: Error (auth/configuration-not-found)"
**Solution:** 
- Check `.env` file has all Firebase config values
- Restart dev server after changing `.env`

### Issue 2: "Firebase: Error (auth/email-already-in-use)"
**Solution:**
- Email already registered
- Use different email or delete user from Firebase Console

### Issue 3: Google Sign-In popup blocked
**Solution:**
- Allow popups in browser settings
- Try again

### Issue 4: Redirect not working after login
**Solution:**
- Check browser console for errors
- Verify Firestore `users` collection has user document
- Verify `role` field exists and is set to "student" or "admin"

### Issue 5: "Loading..." stuck forever
**Solution:**
- Check browser console for errors
- Verify Firebase config in `.env`
- Check Firestore security rules allow read/write

---

## Test Summary Checklist

Copy this checklist and mark each test as you complete it:

- [ ] Test 1: User Registration (Email/Password)
- [ ] Test 2: User Logout
- [ ] Test 3: User Login (Email/Password)
- [ ] Test 4: Google Sign-In
- [ ] Test 5: Protected Routes (redirect to login)
- [ ] Test 6: Role-Based Access (Student cannot access admin)
- [ ] Test 7: Manual Admin Promotion
- [ ] Test 8: Role-Based Access (Admin can access all)
- [ ] Test 9: Password Validation
- [ ] Test 10: Form Validation
- [ ] Test 11: Auth State Persistence

---

## Next Steps

Once all tests pass:

✅ Phase 2 is complete and verified
🚀 Ready to proceed to Phase 3: Public Website (Home, About, Team, Contact)

---

## Need Help?

If any test fails:
1. Check browser console for errors (F12)
2. Check Firebase Console for data
3. Verify `.env` configuration
4. Review `SETUP_GUIDE.md` for environment setup

**Happy testing! 🎉**
