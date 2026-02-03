import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';

const Events = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all'); // all | upcoming | ongoing | past

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch all events and filter by status
        const snapshot = await getDocs(collection(db, 'events'));
        const eventsData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  // Count events by status
  const upcomingCount = events.filter(e => e.status === 'upcoming').length;
  const ongoingCount = events.filter(e => e.status === 'ongoing').length;
  const pastCount = events.filter(e => e.status === 'past').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Events</h1>
          <p className="text-xl text-blue-100">Explore TechNova's workshops, hackathons, and more</p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-semibold transition-colors ${
                filter === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 font-semibold transition-colors ${
                filter === 'upcoming'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setFilter('ongoing')}
              className={`px-4 py-2 font-semibold transition-colors ${
                filter === 'ongoing'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ongoing ({ongoingCount})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 font-semibold transition-colors ${
                filter === 'past'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past ({pastCount})
            </button>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No events found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const isPast = event.status === 'past';
                const isUpcoming = event.status === 'upcoming';
                const isOngoing = event.status === 'ongoing';
                const deadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();

                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                      isPast ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          isUpcoming ? 'bg-blue-100 text-blue-800' :
                          isOngoing ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status.toUpperCase()}
                        </span>
                        {deadlinePassed && !isPast && (
                          <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full">
                            Registration Closed
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                      <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div>📅 Duration: {event.duration || 'TBD'}</div>
                        {event.registrationDeadline && (
                          <div className={deadlinePassed ? 'text-red-600 font-semibold' : ''}>
                            ⏰ Register by: {new Date(event.registrationDeadline).toLocaleDateString()}
                          </div>
                        )}
                        <div>👥 Capacity: {event.capacity}</div>
                        {event.contactPhone && <div>📞 {event.contactPhone}</div>}
                      </div>

                      {!isPast && !deadlinePassed && !currentUser && (
                        <Link
                          to="/register"
                          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
                        >
                          Sign Up to Register
                        </Link>
                      )}

                      {!isPast && !deadlinePassed && currentUser && (
                        <Link
                          to="/student/dashboard"
                          className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-colors"
                        >
                          Register Now
                        </Link>
                      )}

                      {(isPast || deadlinePassed) && (
                        <div className="text-center text-gray-500 py-2">
                          {isPast ? 'Event Completed' : 'Registration Closed'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!currentUser && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Want to Participate?</h2>
            <p className="text-lg text-gray-700 mb-8">
              Sign up for a TechNova account to register for events and get exclusive access to workshops and resources.
            </p>
            <Link
              to="/register"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Create Your Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Events;
