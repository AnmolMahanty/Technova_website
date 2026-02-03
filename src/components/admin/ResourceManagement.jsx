import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, deleteDoc, query, where, addDoc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebase';

const ResourceManagement = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [resources, setResources] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'pdf',
    file: null,
    url: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvent();
    fetchResources();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        setEvent({ id: eventDoc.id, ...eventDoc.data() });
      } else {
        alert('Event not found');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const resourcesSnapshot = await getDocs(collection(db, 'resources'));
      const resourcesData = resourcesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(resource => resource.eventId === eventId)
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      
      setResources(resourcesData);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0],
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let resourceUrl;
      let publicId = null;

      if (formData.type === 'link') {
        // For links, just use the provided URL
        resourceUrl = formData.url;
        if (!resourceUrl) {
          alert('Please enter a URL');
          setUploading(false);
          return;
        }
      } else {
        // For files, upload to Cloudinary directly from client
        if (!formData.file) {
          alert('Please select a file');
          setUploading(false);
          return;
        }

        // Upload to Cloudinary using unsigned upload
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.file);
        uploadFormData.append('upload_preset', uploadPreset);
        uploadFormData.append('folder', `technova/events/${eventId}/resources`);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          {
            method: 'POST',
            body: uploadFormData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error('Cloudinary error:', data);
          throw new Error(data.error?.message || 'Cloudinary upload failed');
        }

        resourceUrl = data.secure_url;
        publicId = data.public_id;
      }

      // Save resource metadata to Firestore
      const resourceData = {
        eventId,
        name: formData.name,
        type: formData.type,
        url: resourceUrl,
        publicId: publicId,
        uploadedBy: auth.currentUser.uid,
        uploadedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'resources'), resourceData);

      alert('Resource uploaded successfully!');
      setShowUploadModal(false);
      setFormData({ name: '', type: 'pdf', file: null, url: '' });
      fetchResources();
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload resource: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      // Delete from Firestore
      // Note: Cloudinary file will remain (cleanup can be done manually or via backend)
      await deleteDoc(doc(db, 'resources', resourceId));

      alert('Resource deleted successfully');
      fetchResources();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete resource');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'ppt':
        return '📊';
      case 'link':
        return '🔗';
      default:
        return '📁';
    }
  };

  if (!event) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="mb-4 text-blue-600 hover:text-blue-800 font-semibold"
      >
        ← Back to Events
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
          <p className="text-gray-600">Manage Resources</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Upload Resource
        </button>
      </div>

      {/* Resources List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resources ({resources.length})</h2>
          
          {resources.length === 0 ? (
            <p className="text-gray-600">No resources uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => (
                <div key={resource.id} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getTypeIcon(resource.type)}</span>
                        <h3 className="text-lg font-bold text-gray-900">{resource.name}</h3>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">
                          {resource.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        📅 Uploaded: {new Date(resource.uploadedAt).toLocaleDateString()}
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {resource.url}
                      </a>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <a
                        href={resource.url}
                        download={resource.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Resource</h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Session 1 Slides, Workshop Material"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type *</label>
                <select
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="ppt">PowerPoint Presentation</option>
                  <option value="link">External Link</option>
                </select>
              </div>

              {formData.type === 'link' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                  <input
                    type="url"
                    name="url"
                    required
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://example.com/resource"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                  <input
                    type="file"
                    accept={formData.type === 'pdf' ? '.pdf' : '.ppt,.pptx'}
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.type === 'pdf' ? 'PDF files only' : 'PPT/PPTX files only'}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Resource'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setFormData({ name: '', type: 'pdf', file: null, url: '' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;
