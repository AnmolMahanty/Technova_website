import { initializeCloudinary, uploadToCloudinary } from '../../utils/cloudinary.js';
import { initializeFirebaseAdmin } from '../../utils/firebaseAdmin.js';
import { getFirestore } from 'firebase-admin/firestore';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
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

    // Parse form data
    const form = formidable({ multiples: false });
    
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { eventId, name, type } = fields;
    const file = files.file;

    if (!eventId || !name || !type) {
      return res.status(400).json({ error: 'Missing required fields: eventId, name, type' });
    }

    let resourceUrl;
    let publicId;

    if (type === 'link') {
      // For links, just use the provided URL
      resourceUrl = fields.url;
      if (!resourceUrl) {
        return res.status(400).json({ error: 'URL required for link type' });
      }
    } else {
      // For files (pdf, ppt), upload to Cloudinary
      if (!file) {
        return res.status(400).json({ error: 'File required for pdf/ppt type' });
      }

      const filePath = file.filepath;
      const resourceType = 'raw'; // For PDFs, PPTs, etc.
      const folder = `technova/events/${eventId}/resources`;

      const uploadResult = await uploadToCloudinary(filePath, folder, resourceType);
      resourceUrl = uploadResult.url;
      publicId = uploadResult.publicId;

      // Clean up temp file
      fs.unlinkSync(filePath);
    }

    // Save resource to Firestore
    const resourceData = {
      eventId,
      name,
      type,
      url: resourceUrl,
      publicId: publicId || null,
      uploadedBy: decodedToken.uid,
      uploadedAt: new Date().toISOString(),
    };

    const resourceRef = await db.collection('resources').add(resourceData);

    return res.status(200).json({
      success: true,
      resourceId: resourceRef.id,
      resource: resourceData,
    });

  } catch (error) {
    console.error('Resource upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
