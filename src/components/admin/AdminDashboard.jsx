import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    registrationDeadline: '',
    status: 'draft',
    capacity: '',
    contactPhone: '',
    registrationQuestions: [],
  });
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch events
  const fetchEvents = async () => {
    try {
      const eventsQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setFormData({
        ...formData,
        registrationQuestions: [...formData.registrationQuestions, newQuestion.trim()]
      });
      setNewQuestion('');
    }
  };

  const removeQuestion = (index) => {
    setFormData({
      ...formData,
      registrationQuestions: formData.registrationQuestions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        mediaUrl: formData.mediaUrl || '',
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline).toISOString() : null,
      };

      if (editingEvent) {
        // Update existing event
        await updateDoc(doc(db, 'events', editingEvent.id), {
          ...eventData,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new event
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdBy: currentUser.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Reset form and close modal
      resetForm();
      setShowCreateModal(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: '',
      registrationDeadline: '',
      status: 'draft',
      capacity: '',
      contactPhone: '',
      registrationQuestions: [],
    });
    setNewQuestion('');
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      duration: event.duration || '',
      registrationDeadline: event.registrationDeadline ? event.registrationDeadline.split('T')[0] : '',
      status: event.status,
      capacity: event.capacity.toString(),
      contactPhone: event.contactPhone || '',
      registrationQuestions: event.registrationQuestions || [],
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This will also delete all sessions and registrations.')) return;

    try {
      // Delete event
      await deleteDoc(doc(db, 'events', eventId));
      
      // Delete associated sessions
      const sessionsQuery = query(collection(db, 'sessions'), where('eventId', '==', eventId));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      for (const sessionDoc of sessionsSnapshot.docs) {
        await deleteDoc(doc(db, 'sessions', sessionDoc.id));
      }

      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      past: 'bg-red-100 text-red-800',
    };
    return badges[status] || badges.draft;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={() => {
            setEditingEvent(null);
            resetForm();
            setShowCreateModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Create Event
        </button>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Events</h2>
          
          {events.length === 0 ? (
            <p className="text-gray-600">No events created yet.</p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{event.name}</h3>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(event.status)}`}>
                          {event.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <div>📅 Duration: {event.duration || 'Not set'}</div>
                        <div>👥 Capacity: {event.capacity}</div>
                        <div>📝 Deadline: {event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString() : 'No deadline'}</div>
                        <div>📞 Contact: {event.contactPhone || 'Not set'}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        to={`/admin/events/${event.id}/sessions`}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                      >
                        Sessions
                      </Link>
                      <Link
                        to={`/admin/events/${event.id}/resources`}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                      >
                        Resources
                      </Link>
                      <button
                        onClick={() => handleEdit(event)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (e.g., "3 days")</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="past">Past</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Registration Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Questions</label>
                <div className="space-y-2 mb-2">
                  {formData.registrationQuestions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <span className="flex-1 text-sm">{index + 1}. {question}</span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Add a question..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingEvent(null);
                    resetForm();
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

export default AdminDashboard;
