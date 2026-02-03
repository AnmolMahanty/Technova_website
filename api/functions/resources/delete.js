import { initializeCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.js';
import { initializeFirebaseAdmin } from '../../utils/firebaseAdmin.js';
import { getFirestore } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  // Only allow DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize services
    initializeCloudinary();
    initializeFirebaseAdmin();
    const db = getFirestore();

    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const admin = (await import('firebase-admin')).default;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Check if user is admin
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Get resourceId from query
    const { resourceId } = req.query;
    if (!resourceId) {
      return res.status(400).json({ error: 'Missing resourceId' });
    }

    // Get resource document
    const resourceDoc = await db.collection('resources').doc(resourceId).get();
    if (!resourceDoc.exists) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const resourceData = resourceDoc.data();

    // Delete from Cloudinary if it has a publicId (not a link)
    if (resourceData.publicId) {
      await deleteFromCloudinary(resourceData.publicId, 'raw');
    }

    // Delete from Firestore
    await db.collection('resources').doc(resourceId).delete();

    return res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
    });

  } catch (error) {
    console.error('Resource deletion error:', error);
    return res.status(500).json({ error: error.message });
  }
}
