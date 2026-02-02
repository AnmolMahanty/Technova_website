import admin from 'firebase-admin';

let db = null;

/**
 * Initialize Firebase Admin SDK
 * Uses environment variables for configuration
 */
export const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  db = admin.firestore();
  return db;
};

/**
 * Get Firestore database instance
 */
export const getDb = () => {
  if (!db) {
    return initializeFirebase();
  }
  return db;
};

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from frontend
 * @returns {Promise<object>} Decoded token with user info
 */
export const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
};

export default admin;
