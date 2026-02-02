# TechNova Official Website

Modern, secure event management platform for the TechNova Innovation & Technology Club.

## Features

- **Public Website**: Home, About, Team, Contact, Events, Highlights
- **Student Portal**: Event registration, resources, attendance, feedback
- **Admin Dashboard**: Event management, session management, attendance tracking, statistics

##Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + React Router
- **Backend**: Node.js + Express (Vercel Serverless)
- **Authentication**: Firebase Auth (Email/Password + Google Sign-In)
- **Database**: Firebase Firestore
- **Storage**: Cloudinary (images, PDFs, PPTs)
- **Email**: Resend (plain-text notifications)

## Project Structure

```
technova-website/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── contexts/          # React contexts (Auth)
│   └── utils/             # Firebase, API, QR utilities
├── api/                   # Backend serverless functions
│   ├── functions/         # API endpoints
│   ├── middleware/        # Auth & role check
│   └── utils/             # Firebase Admin, Cloudinary, Resend
└── public/                # Static assets
```

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project
- Cloudinary account
- Resend account

### Setup

1. **Clone and Install**
```bash
npm install
cd api && npm install && cd ..
```

2. **Environment Variables**
   - Copy `.env.example` to `.env` in root
   - Copy `api/.env.example` to `api/.env`
   - Fill in Firebase, Cloudinary, and Resend credentials

3. **Run Development Servers**
```bash
# Frontend (port 5173)
npm run dev

# Backend (port 3000) - in separate terminal
cd api && npm run dev
```

## Deployment

### Vercel Deployment
```bash
vercel
```

Set environment variables in Vercel dashboard for production.

## Security

- Backend QR code signing prevents frontend tampering
- Server-side validation for all critical operations
- Role-based access control (Student/Admin)
- Firebase security rules enforce data access

## Documentation

See `implementation_plan.md` for detailed architecture and setup guide.

## License

Private - TechNova Club
