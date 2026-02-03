import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const SessionManagement = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvent();
    fetchSessions();
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

  const fetchSessions = async () => {
    try {
      // Temporarily fetch all sessions to avoid index requirement
      // TODO: Revert to query with where+orderBy once Firestore index is fully built
      const snapshot = await getDocs(collection(db, 'sessions'));
      
      // Filter and sort in JavaScript
      const sessionsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(session => session.eventId === eventId)
        .sort((a, b) => {
          // Sort by date first
          if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
          }
          // Then by start time
          return a.startTime.localeCompare(b.startTime);
        });
      
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sessionData = {
        eventId,
        ...formData,
        attendanceOpen: false,
      };

      if (editingSession) {
        // Update existing session
        await updateDoc(doc(db, 'sessions', editingSession.id), {
          ...sessionData,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new session
        await addDoc(collection(db, 'sessions'), {
          ...sessionData,
          createdAt: new Date().toISOString(),
        });
      }

      // Reset form and close modal
      setFormData({
        name: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
      });
      setShowCreateModal(false);
      setEditingSession(null);
      fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location || '',
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      await deleteDoc(doc(db, 'sessions', sessionId));
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  const toggleAttendance = async (session) => {
    try {
      await updateDoc(doc(db, 'sessions', session.id), {
        attendanceOpen: !session.attendanceOpen,
      });
      fetchSessions();
    } catch (error) {
      console.error('Error toggling attendance:', error);
      alert('Failed to toggle attendance');
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
          <p className="text-gray-600">Manage Sessions</p>
        </div>
        <button
          onClick={() => {
            setEditingSession(null);
            setFormData({
              name: '',
              date: '',
              startTime: '',
              endTime: '',
              location: '',
            });
            setShowCreateModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Add Session
        </button>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sessions ({sessions.length})</h2>
          
          {sessions.length === 0 ? (
            <p className="text-gray-600">No sessions created yet. Add sessions to define the event schedule.</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{session.name}</h3>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          session.attendanceOpen 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.attendanceOpen ? 'Attendance Open' : 'Attendance Closed'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <div>📅 {session.date}</div>
                        <div>🕐 {session.startTime} - {session.endTime}</div>
                        {session.location && <div>📍 {session.location}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => toggleAttendance(session)}
                        className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                          session.attendanceOpen
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {session.attendanceOpen ? 'Close' : 'Open'}
                      </button>
                      <button
                        onClick={() => handleEdit(session)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
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
              {editingSession ? 'Edit Session' : 'Add New Session'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Day 1 - Introduction to AI"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    required
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    name="endTime"
                    required
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Auditorium, Room 301"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingSession ? 'Update Session' : 'Add Session'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSession(null);
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

export default SessionManagement;
