import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  const handleDashboardClick = () => {
    if (userRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (userRole === 'student') {
      navigate('/student/dashboard');
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-galaxy-purple to-galaxy-blue bg-clip-text text-transparent">
                TechNova
              </span>
            </Link>
            
            {/* Public Navigation Links */}
            <div className="hidden md:flex items-center ml-8 space-x-4">
              <Link
                to="/events"
                className="text-gray-700 hover:text-galaxy-purple px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Events
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-galaxy-purple px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="/team"
                className="text-gray-700 hover:text-galaxy-purple px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Team
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-galaxy-purple px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              // Logged In User
              <>
                <button
                  onClick={handleDashboardClick}
                  className="text-gray-700 hover:text-galaxy-purple px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </button>
                
                <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                  <div className="text-sm">
                    <p className="text-gray-700 font-medium">
                      {currentUser.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userRole}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              // Not Logged In
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-galaxy-purple px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-galaxy-purple hover:bg-galaxy-blue text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
