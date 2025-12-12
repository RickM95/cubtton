import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Logo from '../assets/Logo.jpg';
import TeddyDay from '../assets/teddy-bear-day.png';
import TeddyNight from '../assets/teddy-bear-night.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth state on mount
    authService.getCurrentUser().then(setUser).catch(console.error);

    // Listen for auth changes (optional, but good for robust apps)
    // For now we rely on the mount check and explicit actions
  }, [location.pathname]); // Re-check on nav change to capture login updates

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setIsProfileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/products' },
  ];

  // If user is NOT logged in, add Login link
  if (!user) {
    navLinks.push({ name: 'Login', path: '/login' });
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass bg-taupe/80 dark:bg-taupe/80 transition-colors duration-300 border-b border-brown/10 dark:border-brown/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-brown dark:text-brown hover:text-terracotta dark:hover:text-terracotta focus:outline-none transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-1 flex justify-center md:justify-start lg:justify-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img className="h-12 w-auto object-contain mix-blend-multiply dark:mix-blend-normal dark:opacity-90" src={Logo} alt="Cubtton" />
            </Link>
          </div>

          {/* Desktop Menu & Toggle */}
          <div className="hidden md:flex items-center absolute right-8 space-x-6">
            <div className="flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium tracking-wide transition-colors duration-300 ${location.pathname === link.path
                    ? 'text-brown dark:text-brown border-b-2 border-terracotta'
                    : 'text-brown/70 dark:text-brown/80 hover:text-brown dark:hover:text-brown'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Profile Dropdown (Desktop) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-brown/20">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-terracotta/20 flex items-center justify-center text-brown font-bold text-xs">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-stone/90 rounded-md shadow-lg py-1 border border-brown/10 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 text-sm text-brown dark:text-brown/80 border-b border-brown/10">
                      Signed in as<br />
                      <span className="font-bold truncate block">{user.email}</span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-brown dark:text-brown hover:bg-brown/5"
                    >
                      Your Profile
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-terracotta hover:bg-brown/5 font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-brown/5"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1 rounded-full hover:bg-canvas dark:hover:bg-canvas/10 transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <img
                src={isDark ? TeddyNight : TeddyDay}
                alt={isDark ? "Dark Mode Bear" : "Light Mode Bear"}
                className="w-8 h-8 object-contain"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass bg-taupe/90 dark:bg-taupe/90 border-t border-brown/20 dark:border-brown/30">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === link.path
                  ? 'text-brown dark:text-brown bg-terracotta/20'
                  : 'text-brown/80 dark:text-brown/90 hover:text-brown dark:hover:text-brown hover:bg-terracotta/10'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-brown/80 dark:text-brown/90 hover:text-brown hover:bg-terracotta/10"
                >
                  Your Profile
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-terracotta/90 hover:text-terracotta hover:bg-terracotta/10"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-terracotta/10"
                >
                  Sign Out
                </button>
              </>
            )}

            {/* Mobile Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-brown dark:text-brown hover:text-terracotta dark:hover:text-terracotta hover:bg-terracotta/10 flex items-center gap-2 transition-colors"
            >
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
              <img
                src={isDark ? TeddyNight : TeddyDay}
                alt={isDark ? "Dark Mode Bear" : "Light Mode Bear"}
                className="w-6 h-6 object-contain"
              />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
