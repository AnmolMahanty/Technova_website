import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-galaxy-purple via-galaxy-blue to-galaxy-dark text-white py-20 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in">
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-blue-200">TechNova</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto">
              Innovation & Technology Club - Empowering students through cutting-edge events, workshops, and collaborative learning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!currentUser ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-galaxy-purple px-8 py-3 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Join TechNova
                  </Link>
                  <Link
                    to="/login"
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-galaxy-purple transition-all transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/student/dashboard"
                  className="bg-white text-galaxy-purple px-8 py-3 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Innovation Events</h3>
              <p className="text-gray-600">
                Participate in hackathons, coding competitions, and tech showcases that push the boundaries of innovation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Expert Workshops</h3>
              <p className="text-gray-600">
                Learn from industry experts through hands-on workshops covering the latest technologies and trends.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Community</h3>
              <p className="text-gray-600">
                Join a vibrant community of tech enthusiasts, collaborate on projects, and build lasting connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Explore TechNova
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/events"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Events</h3>
              <p className="text-gray-600 text-sm">Browse upcoming and past events</p>
            </Link>

            <Link
              to="/about"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">ℹ️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">About Us</h3>
              <p className="text-gray-600 text-sm">Learn about TechNova's mission</p>
            </Link>

            <Link
              to="/team"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Team</h3>
              <p className="text-gray-600 text-sm">Meet the people behind TechNova</p>
            </Link>

            <Link
              to="/contact"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all text-center group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact</h3>
              <p className="text-gray-600 text-sm">Get in touch with us</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!currentUser && (
        <section className="py-20 px-4 bg-gradient-to-r from-galaxy-purple to-galaxy-blue text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-purple-100">
              Join TechNova today and be part of the innovation revolution
            </p>
            <Link
              to="/register"
              className="bg-white text-galaxy-purple px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg inline-block"
            >
              Create Your Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
