import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const unreadCount = useSelector((store) => store.notification.totalUnread);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
    } catch (err) {
      console.log("Logout API error:", err);
    } finally {
      dispatch(removeUser());
      navigate("/login");
    }
  };

  const navLinks = [
    { label: "Home", path: "/", icon: "🏠" },
    { label: "Connections", path: "/user/connections", icon: "👥" },
    { label: "Requests", path: "/user/requests/received", icon: "📬" },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 bg-gradient-to-b from-white/80 via-white/60 to-transparent backdrop-blur-xl border-b border-white/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition-all duration-300"
            onClick={() => setMenuOpen(false)}
          >
            <div className="text-3xl md:text-4xl group-hover:animate-float transition-all duration-300">
              🧑‍💻
            </div>
            <div className="flex flex-col">
              <span className="hidden sm:block font-display font-bold text-2xl bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 bg-clip-text text-transparent group-hover:drop-shadow-lg transition-all duration-300">
                DevConnect
              </span>
              <span className="hidden sm:block text-xs text-primary-600 font-semibold">
                Find Your Dev Team
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onMouseEnter={() => setHoveredLink(link.path)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="relative px-5 py-2 text-neutral-700 font-semibold text-sm transition-all duration-300 rounded-lg group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl group-hover:scale-125 transition-transform duration-300">
                      {link.icon}
                    </span>
                    {link.label}
                  </span>
                  {hoveredLink === link.path && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-slide-up"></div>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Right Section */}
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              {/* Messages Icon with Badge */}
              <Link
                to="/notifications"
                className="relative p-3 text-neutral-700 hover:text-primary-600 hover:bg-primary-50/50 rounded-full transition-all duration-300 group glass"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-6 h-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center transform transition-all duration-300 animate-pop-in shadow-lg">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-3 p-1.5 hover:bg-neutral-50/50 rounded-full transition-all duration-300 group"
                >
                  <div className="relative">
                    <img
                      src={user.photoUrl}
                      alt={user.firstName}
                      className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 border-primary-300 group-hover:border-primary-500 group-hover:shadow-lg group-hover:shadow-primary-500/40 transition-all duration-300"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-neutral-900 group-hover:text-primary-600 transition-colors duration-300">
                      {user.firstName}
                    </p>
                    <p className="text-xs text-neutral-500">Online</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-neutral-700 transition-all duration-300 ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-neutral-500/20 border border-white/40 overflow-hidden animate-slide-down">
                    {/* Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-b border-white/20">
                      <p className="font-bold text-neutral-900">Welcome back!</p>
                      <p className="text-sm text-neutral-600 mt-1">@{user.firstName}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile/view"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-4 w-full px-6 py-4 text-neutral-700 hover:bg-primary-50/50 hover:text-primary-600 transition-all duration-300 border-b border-neutral-100/50 group"
                      >
                        <span className="text-2xl group-hover:scale-125 transition-transform duration-300">👤</span>
                        <div>
                          <p className="font-semibold">View Profile</p>
                          <p className="text-xs text-neutral-500">See your public profile</p>
                        </div>
                      </Link>
                      <Link
                        to="/profile/edit"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-4 w-full px-6 py-4 text-neutral-700 hover:bg-accent-50/50 hover:text-accent-600 transition-all duration-300 border-b border-neutral-100/50 group"
                      >
                        <span className="text-2xl group-hover:scale-125 transition-transform duration-300">✏️</span>
                        <div>
                          <p className="font-semibold">Edit Profile</p>
                          <p className="text-xs text-neutral-500">Update your information</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-4 w-full px-6 py-4 text-red-600 hover:bg-red-50 transition-all duration-300 font-semibold group"
                      >
                        <span className="text-2xl group-hover:scale-125 transition-transform duration-300">🚪</span>
                        <div>
                          <p className="font-semibold">Logout</p>
                          <p className="text-xs text-red-500">Sign out of DevConnect</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-3 hover:bg-neutral-100/50 rounded-lg transition-all duration-300 glass"
              >
                <svg
                  className={`w-6 h-6 text-neutral-700 transition-transform duration-300 ${
                    menuOpen ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="btn-primary py-2 px-4 text-sm md:text-base"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
