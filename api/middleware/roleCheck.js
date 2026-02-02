import { getDb } from '../utils/firestore.js';

/**
 * Role check middleware
 * Verifies user has required role (student or admin)
 * Must be used AFTER authenticate middleware
 */
export const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const db = getDb();
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      
      if (!userDoc.exists) {
        return res.status(403).json({ error: 'Forbidden - User not found' });
      }
      
      const userData = userDoc.data();
      const userRole = userData.role;
      
      // Check if user role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      }
      
      // Attach role to request for use in route handlers
      req.user.role = userRole;
      req.user.userData = userData;
      
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Server error during authorization' });
    }
  };
};

/**
 * Shorthand for admin-only routes
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Shorthand for student routes (allows both student and admin)
 */
export const requireStudent = requireRole(['student', 'admin']);
