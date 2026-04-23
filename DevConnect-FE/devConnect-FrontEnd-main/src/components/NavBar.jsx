import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            🧑‍💻 DevTinder
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/user/connections"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                >
                  Connections
                </Link>
                <Link
                  to="/user/requests/received"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                >
                  Requests
                </Link>

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <span className="hidden sm:inline text-gray-700">
                      {user.firstName}
                    </span>
                    <img
                      src={user.photoUrl}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full border-2 border-indigo-500 hover:border-indigo-700 transition-all"
                    />
                  </button>
                  <ul className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 z-50">
                    <li>
                      <Link
                        to="/profile/view"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 rounded-md transition-colors"
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-600 rounded-md transition-colors"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && user && (
        <div className="md:hidden bg-white shadow-md">
          <Link
            to="/"
            className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/user/connections"
            className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
          >
            Connections
          </Link>
          <Link
            to="/user/requests/received"
            className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
          >
            Requests
          </Link>
          <Link
            to="/profile/view"
            className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
