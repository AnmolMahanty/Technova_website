/**
 * API utility for making requests to backend
 * Automatically includes Firebase auth token in requests
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get Firebase auth token for current user
 */
const getAuthToken = async () => {
  const { auth } = await import('./firebase.js');
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/events/register')
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
};

/**
 * GET request
 */
export const apiGet = (endpoint) => apiRequest(endpoint, { method: 'GET' });

/**
 * POST request
 */
export const apiPost = (endpoint, body) => apiRequest(endpoint, {
  method: 'POST',
  body: JSON.stringify(body),
});

/**
 * PUT request
 */
export const apiPut = (endpoint, body) => apiRequest(endpoint, {
  method: 'PUT',
  body: JSON.stringify(body),
});

/**
 * DELETE request
 */
export const apiDelete = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};
