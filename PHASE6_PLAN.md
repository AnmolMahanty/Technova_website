# Phase 6 Implementation Plan - Attendance System

## Overview
Implement QR-based attendance system with session-wise tracking, backend QR signing for security, admin scanning interface, and comprehensive statistics/export functionality.

---

## SRS Requirements (Section 4.5)

### Core Requirements:
1. **QR Code Generation** - Per student per session with backend signing
2. **Attendance Windows** - Auto open/close per session + manual override
3. **QR Scanning** - Admin-only interface with validation
4. **Duplicate Prevention** - One attendance per session per student
5. **Statistics** - Event-level and session-level reporting
6. **Data Export** - CSV/Excel with session-wise breakdown

---

## Architecture

### Backend API (Vercel Serverless Functions):
```
api/functions/attendance/
├── generateQR.js          # Generate signed QR for student/session
├── validateQR.js          # Validate QR signature
├── markAttendance.js      # Mark attendance (QR or manual)
├── getAttendance.js       # Fetch attendance records
└── getStatistics.js       # Event/session statistics
```

### Frontend Components:
```
src/components/
├── student/
│   └── AttendanceQR.jsx   # Display QR codes per session
└── admin/
    ├── QRScanner.jsx      # Scan student QR codes
    └── AttendanceStats.jsx # View statistics & export
```

### Firestore Collection:
```
attendance/{attendanceId}
  - eventId: string
  - sessionId: string
  - userId: string
  - method: "qr" | "manual"
  - markedBy: string (adminId)
  - markedAt: timestamp
```

---

## QR Code Security

### Backend Signing (CRITICAL):
**QR Payload:**
```javascript
{
  eventId: "evt123",
  sessionId: "sess456",
  userId: "user789",
  timestamp: 1234567890,
  signature: "HMAC-SHA256(eventId|sessionId|userId|timestamp, SECRET_KEY)"
}
```

**Why Backend Signing:**
- Students cannot forge QR codes
- QR data cryptographically verified
- Timestamp prevents replay attacks

**Secret Management:**
- `QR_SIGNING_SECRET` in backend `.env`
- Never exposed to frontend
- Use crypto.createHmac for signing

---

## Implementation Steps

### **Step 1: Backend QR Generation API** ✅

**File:** `api/functions/attendance/generateQR.js`

**Flow:**
1. Verify user is authenticated (Firebase ID token)
2. Verify user is registered for event
3. Generate signed payload with timestamp
4. Return base64 QR data URL

**Dependencies:**
- `qrcode` package (already installed)
- `crypto` (Node.js built-in)

---

### **Step 2: Backend QR Validation API** ✅

**File:** `api/functions/attendance/markAttendance.js`

**Flow:**
1. Admin scans QR → sends payload to backend
2. Verify signature using same secret
3. Check timestamp (within attendance window)
4. Verify student registration
5. Check if already marked
6. Create attendance record
7. Return student name + success

---

### **Step 3: Student QR Display Component** ✅

**File:** `src/components/student/AttendanceQR.jsx`

**UI:**
- List all sessions for event
- For each session:
  - If attendance window open: Show QR code
  - If already attended: Show "Already Marked ✓"
  - If window closed: Show "Attendance Closed"

**API Call:**
- `POST /api/attendance/generateQR` with `{eventId, sessionId}`
- Display returned QR code image

---

### **Step 4: Admin QR Scanner** ✅

**File:** `src/components/admin/QRScanner.jsx`

**UI:**
- Select event + session
- Camera/file upload for QR scanning
- Display scanned student info
- Manual attendance fallback

**Library:** `html5-qrcode` or `react-qr-scanner`

**Flow:**
1. Scan QR code
2. Extract JSON payload
3. Send to `/api/attendance/markAttendance`
4. Display result (student name + confirmation)

---

### **Step 5: Session Attendance Windows** ✅

**Implementation:**
- Add `attendanceOpen` boolean to `sessions` collection
- Auto-calculation in frontend:
  - Open: 1 hour before session start
  - Close: 1 hour after session start
- Admin override: Toggle `attendanceOpen` manually

**Admin UI:**
- SessionManagement: Add "Toggle Attendance" button per session
- Show current status (Open/Closed)

---

### **Step 6: Attendance Statistics** ✅

**File:** `src/components/admin/AttendanceStats.jsx`

**Event-Level Stats:**
- Total registrations
- Students who completed ALL sessions
- Registered but incomplete

**Session-Level Stats:**
- Session name, date, time
- Attendance count
- List of attended students

**API:** `GET /api/attendance/statistics/:eventId`

---

### **Step 7: Data Export** ✅

**Format:** CSV/Excel

**Columns:**
```
Student Name | Email | Session 1 (Y/N) | Session 2 (Y/N) | ... | All Completed (Y/N)
```

**Implementation:**
- Use `papaparse` or `xlsx` library
- Generate client-side from statistics data
- Download as CSV file

---

## Routing

### New Routes:
```javascript
// Student
/student/attendance/:eventId

// Admin
/admin/scan/:eventId/:sessionId
/admin/statistics/:eventId
```

---

## Security Checklist

- [x] QR generation only on backend
- [x] QR signature verification on backend
- [x] Timestamp validation (prevent replay)
- [x] Registration verification
- [x] Duplicate prevention
- [x] Admin-only scanning
- [x] Firestore rules for attendance collection

---

## Firestore Rules Update

```javascript
// Attendance collection
match /attendance/{attendanceId} {
  // Students can read their own attendance
  allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
  
  // Only admins can write attendance
  allow create, update, delete: if isAdmin();
}
```

---

## Testing Plan

### Unit Tests:
1. QR signature generation/validation
2. Attendance window calculations
3. Duplicate prevention

### Integration Tests:
1. Student generates QR → Admin scans → Attendance marked
2. Window auto-open/close logic
3. Statistics accuracy
4. Export file format

### Manual Tests:
1. Full attendance flow (student → admin)
2. Multiple sessions per event
3. Manual attendance override
4. Export CSV and verify format

---

## Dependencies

### New NPM Packages:
```bash
# Frontend
npm install html5-qrcode

# Backend (already have qrcode)
# crypto (built-in)
```

---

## Implementation Order

1. ✅ Backend: QR generation API with signing
2. ✅ Backend: Attendance marking API with validation
3. ✅ Student: QR display component
4. ✅ Admin: QR scanner component
5. ✅ Admin: Session attendance toggle
6. ✅ Admin: Statistics view
7. ✅ Admin: Data export
8. ✅ Testing & validation

---

## Success Criteria

- [ ] Students can generate unique QR per session
- [ ] QR codes are cryptographically signed (backend)
- [ ] Admins can scan QR and mark attendance
- [ ] Attendance windows auto-open/close per session
- [ ] Duplicate attendance prevented
- [ ] Statistics show event-level and session-level data
- [ ] Export generates session-wise CSV
- [ ] Firestore rules enforce security

---

**Estimated Complexity:** High  
**Estimated Time:** 6-8 hours  
**Critical Path:** Backend QR signing → Student QR display → Admin scanning

---

## Next Steps

1. Create backend API folder structure
2. Implement QR signing utility
3. Build generateQR endpoint
4. Build markAttendance endpoint
5. Create student AttendanceQR component
6. Integrate QR scanner library
7. Build admin QRScanner component
8. Add statistics view
9. Implement export functionality
10. Test end-to-end flow

**Ready to begin implementation!** 🚀
