# TechNova Website - Setup Guide

This document provides step-by-step instructions to set up your local development environment and deploy the TechNova website.

---

## Prerequisites

- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn**: Comes with Node.js
- **Git**: For version control
- **Firebase Account**: [Create account](https://firebase.google.com/)
- **Cloudinary Account**: [Create account](https://cloudinary.com/)
- **Resend Account**: [Create account](https://resend.com/)

---

## Part 1: Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Enter project name: `technova-website`
4. Disable Google Analytics (or enable if needed)
5. Click **"Create Project"**

### Step 2: Enable Authentication

1. In Firebase Console → **Authentication** → **Get Started**
2. Click **Sign-in method** tab
3. Enable **Email/Password**:
   - Toggle to enabled
   - Click **Save**
4. Enable **Google Sign-In**:
   - Toggle to enabled
   - Enter support email
   - Click **Save**

### Step 3: Create Firestore Database

1. Go to **Firestore Database** → **Create Database**
2. Select **"Start in production mode"**
3. Choose location: **asia-south1 (Mumbai, India)**
4. Click **"Enable"**

### Step 4: Set Firestore Security Rules

1. In Firestore → **Rules** tab
2. Copy the security rules from `implementation_plan.md` Section 11.1 Step 4
3. Click **"Publish"**

### Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"**
3. Click web icon `</>`
4. Register app with nickname: `technova-web`
5. Copy the `firebaseConfig` object
6. Keep this handy for environment variables

### Step 6: Download Service Account Key (for Backend)

1. Go to **Project Settings** → **Service Accounts** tab
2. Click **"Generate new private key"**
3. Download the JSON file
4. Extract: `project_id`, `client_email`, `private_key`
5. These will go in backend `.env` file

---

## Part 2: Cloudinary Setup

### Step 1: Create Account
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Verify your email

### Step 2: Get Credentials
1. Go to **Dashboard**
2. Note down:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 3: Create Upload Preset (for frontend)
1. Go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click **"Add upload preset"**
4. Configure:
   - Signing Mode: **Unsigned**
   - Folder: `technova/events`
   - Preset name: Note this down (e.g., `technova_events`)
5. Click **Save**

---

## Part 3: Resend Setup

### Step 1: Create Account
1. Go to [Resend](https://resend.com/)
2. Sign up for free account
3. Verify your email

### Step 2: Get API Key
1. Go to **API Keys**
2. Click **"Create API Key"**
3. Name: `technova-production`
4. Copy the API key (shown only once!)

### Step 3: Configure Domain (Optional for Production)
For testing, you can use `onboarding@resend.dev` as sender.
For production:
1. Go to **Domains** → **"Add Domain"**
2. Enter your domain
3. Add DNS records provided by Resend
4. Verify domain

---

## Part 4: Local Development Setup

### Step 1: Clone Repository & Install Dependencies

```bash
# Navigate to project directory
cd Technova_website

# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
cd ..
```

### Step 2: Configure Frontend Environment Variables

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Edit `.env` and fill in values:
```env
# Firebase Configuration (from Part 1, Step 5)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Cloudinary (from Part 2)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=technova_events

# Backend API
VITE_API_URL=http://localhost:3000/api
```

### Step 3: Configure Backend Environment Variables

1. Navigate to API folder and copy template:
```bash
cd api
copy .env.example .env
cd ..
```

2. Edit `api/.env` and fill in values:
```env
# Firebase Admin SDK (from Part 1, Step 6)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Cloudinary (from Part 2)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret

# Resend (from Part 3)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# QR Code Secret (generate new random key)
QR_SECRET=

# Environment
NODE_ENV=development
```

### Step 4: Generate QR Secret

Run this command to generate a secure random key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste into `QR_SECRET` in `api/.env`

### Step 5: Run Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Access at: http://localhost:5173

**Terminal 2 - Backend (when ready):**
```bash
cd api
npm run dev
```
Access at: http://localhost:3000

---

## Part 5: Verify Setup

### Check Frontend
1. Open http://localhost:5173
2. You should see the default Vite + React page
3. Check browser console for errors

### Check Firebase Connection
1. Open browser developer tools → Console
2. Look for Firebase initialization messages
3. No errors = successful connection

---

## Part 6: Production Deployment (Vercel)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

Follow prompts:
- Link to existing project or create new
- Set project settings

### Step 4: Configure Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add ALL variables from `.env` and `api/.env`
3. Set for **Production**, **Preview**, and **Development**

### Step 5: Deploy to Production
```bash
vercel --prod
```

---

## Troubleshooting

### Firebase Connection Issues
- Verify all Firebase config values are correct
- Check Firebase console for enabled authentication methods
- Ensure Firestore is in same region

### Cloudinary Upload Fails
- Verify Cloud Name and Upload Preset are correct
- Check upload preset is set to "Unsigned"
- Ensure folder path is correct

### Resend Email Not Sending
- Verify API key is correct
- Check sender email is verified
- For custom domain, ensure DNS records are configured

### Port Already in Use
```bash
# Change port in vite.config.js or kill process using port
npx kill-port 5173
```

---

## Next Steps After Setup

Once setup is complete and verified:

1. ✅ **Phase 1 Complete**: Infrastructure ready
2. 🔄 **Start Phase 2**: Implement authentication (Login, Register, AuthContext)
3. 📋 Follow `implementation_plan.md` for phased development

---

## Folder Structure Verification

After setup, your structure should match:

```
Technova_website/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   ├── public/
│   │   ├── student/
│   │   └── admin/
│   ├── contexts/
│   ├── utils/
│   └── assets/
├── api/
│   ├── functions/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── sessions/
│   │   ├── attendance/
│   │   └── ...
│   ├── middleware/
│   └── utils/
└── public/
```

---

## Important Notes

⚠️ **Security**:
- Never commit `.env` files to version control
- Keep Firebase service account key secure
- Rotate API keys periodically

⚠️ **Firestore Security Rules**:
- Apply production security rules before launch
- Test rules thoroughly

⚠️ **Costs**:
- Monitor Firebase, Cloudinary, and Resend usage
- All services have free tiers suitable for development

---

## Support & Resources

- **Implementation Plan**: `implementation_plan.md`
- **Task Checklist**: `task.md` (in brain folder)
- **Firebase Docs**: https://firebase.google.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Resend Docs**: https://resend.com/docs

---

**Setup complete! Ready for Phase 2: Authentication & Authorization** 🚀
