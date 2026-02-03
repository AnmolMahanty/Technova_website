import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming | myEvents
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationAnswers, setRegistrationAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [resources, setResources] = useState([]);

  // Fetch all upcoming events
  const fetchEvents = async () => {
    try {
      // Fetch all events and filter in JavaScript to avoid index requirement
      const snapshot = await getDocs(collection(db, 'events'));
      const eventsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(event => event.status === 'upcoming' || event.status === 'ongoing')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Fetch user's registered events
  const fetchMyEvents = async () => {
    try {
      // Fetch all registrations and filter in JavaScript
      const regSnapshot = await getDocs(collection(db, 'registrations'));
      const userRegistrations = regSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(reg => reg.userId === currentUser.uid);
      
      const registeredEventIds = userRegistrations.map(reg => reg.eventId);

      if (registeredEventIds.length === 0) {
        setMyEvents([]);
        return;
      }

      // Fetch all events and filter by registered event IDs
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const userEvents = eventsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(event => registeredEventIds.includes(event.id));
      
      setMyEvents(userEvents);
    } catch (error) {
      console.error('Error fetching my events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchMyEvents();
  }, [currentUser]);

  // Check if user is registered for an event
  const isRegistered = (eventId) => {
    return myEvents.some(event => event.id === eventId);
  };

  // Check if registration deadline has passed
  const isDeadlinePassed = (event) => {
    if (!event.registrationDeadline) return false;
    return new Date(event.registrationDeadline) < new Date();
  };

  // Check if event is full
  const isFull = async (eventId) => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (!eventDoc.exists()) return false;
      
      const event = eventDoc.data();
      
      // Count registrations
      const regQuery = query(collection(db, 'registrations'), where('eventId', '==', eventId));
      const regSnapshot = await getDocs(regQuery);
      
      return regSnapshot.size >= event.capacity;
    } catch (error) {
      console.error('Error checking capacity:', error);
      return false;
    }
  };

  // Open registration modal
  const handleRegisterClick = async (event) => {
    // Check if event is full
    const full = await isFull(event.id);
    if (full) {
      alert('Sorry, this event is full!');
      return;
    }

    // Check deadline
    if (isDeadlinePassed(event)) {
      alert('Registration deadline has passed for this event');
      return;
    }

    setSelectedEvent(event);
    setRegistrationAnswers({});
    setShowRegistrationModal(true);
  };

  // Register for an event
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create registration with composite key
      const registrationId = `${currentUser.uid}_${selectedEvent.id}`;
      
      await setDoc(doc(db, 'registrations', registrationId), {
        eventId: selectedEvent.id,
        userId: currentUser.uid,
        responses: registrationAnswers,
        registeredAt: new Date().toISOString(),
      });

      alert('Successfully registered for event!');
      setShowRegistrationModal(false);
      setSelectedEvent(null);
      setRegistrationAnswers({});
      fetchEvents();
      fetchMyEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Failed to register for event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Unregister from an event
  const handleUnregister = async (eventId) => {
    if (!confirm('Are you sure you want to unregister from this event?')) return;

    setLoading(true);
    try {
      const registrationId = `${currentUser.uid}_${eventId}`;
      await deleteDoc(doc(db, 'registrations', registrationId));

      alert('Successfully unregistered from event');
      fetchEvents();
      fetchMyEvents();
    } catch (error) {
      console.error('Error unregistering from event:', error);
      alert('Failed to unregister from event');
    } finally {
      setLoading(false);
    }
  };

  // Fetch resources for an event
  const fetchEventResources = async (eventId) => {
    try {
      const resourcesSnapshot = await getDocs(collection(db, 'resources'));
      const eventResources = resourcesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(resource => resource.eventId === eventId)
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      
      setResources(eventResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  // Open resources modal
  const handleViewResources = async (event) => {
    setSelectedEvent(event);
    setShowResourcesModal(true);
    await fetchEventResources(event.id);
  };

  // Get type icon
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
      <p className="text-gray-600 mb-8">Browse and register for upcoming events</p>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'upcoming'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('myEvents')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'myEvents'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Events ({myEvents.length})
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {activeTab === 'upcoming' && (
          <>
            {events.length === 0 ? (
              <p className="text-gray-600">No upcoming events available.</p>
            ) : (
              events.map((event) => {
                const registered = isRegistered(event.id);
                const deadlinePassed = isDeadlinePassed(event);

                return (
                  <div key={event.id} className="bg-white border rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {event.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">{event.description}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                          <div>📅 Duration: {event.duration || 'TBD'}</div>
                          <div>👥 Capacity: {event.capacity}</div>
                          {event.registrationDeadline && (
                            <div className={deadlinePassed ? 'text-red-600 font-semibold' : ''}>
                              ⏰ Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                              {deadlinePassed && ' (Passed)'}
                            </div>
                          )}
                          {event.contactPhone && <div>📞 {event.contactPhone}</div>}
                        </div>
                      </div>
                      <div className="ml-4">
                        {registered ? (
                          <button
                            onClick={() => handleUnregister(event.id)}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                          >
                            Unregister
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegisterClick(event)}
                            disabled={loading || deadlinePassed}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deadlinePassed ? 'Deadline Passed' : 'Register'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {activeTab === 'myEvents' && (
          <>
            {myEvents.length === 0 ? (
              <p className="text-gray-600">You haven't registered for any events yet.</p>
            ) : (
              myEvents.map((event) => (
                <div key={event.id} className="bg-white border rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                          Registered ✓
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{event.description}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <div>📅 Duration: {event.duration || 'TBD'}</div>
                        <div>📞 {event.contactPhone || 'Contact info not available'}</div>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <button
                        onClick={() => handleViewResources(event)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        View Resources
                      </button>
                      <button
                        onClick={() => handleUnregister(event.id)}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        Unregister
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Register for {selectedEvent.name}</h2>

            {selectedEvent.registrationQuestions && selectedEvent.registrationQuestions.length > 0 ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <p className="text-gray-700 mb-4">Please answer the following questions:</p>
                
                {selectedEvent.registrationQuestions.map((question, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {index + 1}. {question} *
                    </label>
                    <textarea
                      required
                      value={registrationAnswers[question] || ''}
                      onChange={(e) => setRegistrationAnswers({
                        ...registrationAnswers,
                        [question]: e.target.value
                      })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    ></textarea>
                  </div>
                ))}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Confirm Registration'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegistrationModal(false);
                      setSelectedEvent(null);
                      setRegistrationAnswers({});
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-gray-700 mb-6">Are you sure you want to register for this event?</p>
                <div className="flex gap-4">
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Confirm Registration'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRegistrationModal(false);
                      setSelectedEvent(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resources Modal */}
      {showResourcesModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Resources for {selectedEvent.name}</h2>

            {resources.length === 0 ? (
              <p className="text-gray-600 mb-6">No resources available for this event yet.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {resources.map((resource) => (
                  <div key={resource.id} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <div className="flex items-start justify-between">
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
                      </div>
                      <a
                        href={resource.url}
                        download={resource.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors ml-4"
                      >
                        {resource.type === 'link' ? 'Open Link' : 'Download'}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setShowResourcesModal(false);
                setSelectedEvent(null);
                setResources([]);
              }}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
