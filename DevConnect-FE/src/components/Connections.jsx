import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnections, removeConnection } from "../utils/connectionSlice";
import { useNavigate, Link } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections) || [];
  const onlineIds = useSelector((store) => store.presence?.onlineIds || []);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterGender, setFilterGender] = useState("all");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });
      dispatch(addConnections(res?.data?.data || []));
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  // Filter and sort connections
  useEffect(() => {
    let result = connections;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (conn) =>
          conn.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conn.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Gender filter
    if (filterGender !== "all") {
      result = result.filter((conn) => conn.gender === filterGender);
    }

    // Sort
    if (sortBy === "recent") {
      result = [...result].reverse();
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        a.firstName.localeCompare(b.firstName)
      );
    }

    setFilteredConnections(result);
  }, [searchTerm, sortBy, filterGender, connections]);

  const handleMessage = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const [removingId, setRemovingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [removeError, setRemoveError] = useState("");

  const handleRemove = async (userId) => {
    setRemovingId(userId);
    setRemoveError("");
    try {
      await axios.delete(`${BASE_URL}/user/connections/${userId}`, {
        withCredentials: true,
      });
    } catch (err) {
      // Fallback: if the dedicated delete endpoint isn't available,
      // try the request review "rejected" endpoint that some backends use.
      try {
        await axios.post(
          `${BASE_URL}/request/review/rejected/${userId}`,
          {},
          { withCredentials: true }
        );
      } catch (err2) {
        // Even if backend errors, still remove from local UI so the
        // user gets immediate feedback. Surface a soft warning.
        console.warn("Remove connection API failed:", err2.message);
        setRemoveError(
          "Removed locally. The server may not support deletion yet."
        );
      }
    } finally {
      dispatch(removeConnection(userId));
      setRemovingId(null);
      setConfirmId(null);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-xl font-semibold text-neutral-700">Loading your connections...</p>
          <p className="text-neutral-500 mt-2">Getting all your amazing connections</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (connections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex items-center justify-center px-4 pt-32">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="text-8xl mb-6 animate-float">🤝</div>
          <h1 className="text-4xl md:text-5xl font-black text-gradient mb-4">
            No Connections Yet
          </h1>
          <p className="text-lg text-neutral-600 mb-10 leading-relaxed">
            Start discovering and connecting with amazing developers!
          </p>
          <Link
            to="/"
            className="btn-primary block w-full text-center"
          >
            Discover Developers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 py-12 pt-32 px-4 md:py-16">
      <div className="section-container">
        {/* Header Section */}
        <div className="mb-12 animate-slide-down">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-block mb-4">
                <span className="badge-primary">👥 Your Network</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-gradient">
                Your Connections
              </h1>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-5xl font-black text-primary-600">
                {filteredConnections.length}
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                {filteredConnections.length === 1 ? "person" : "people"} connected
              </p>
            </div>
          </div>
          <p className="text-xl text-neutral-600">
            Stay connected with your network and collaborate on amazing projects
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 p-6 mb-12 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base pl-12 py-3 w-full"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-base px-4 py-3"
            >
              <option value="recent">Sort by Recent</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Gender Filter */}
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="input-base px-4 py-3"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 flex items-center justify-between animate-slide-up" style={{animationDelay: "0.1s"}}>
          <p className="text-neutral-600 font-semibold">
            Showing <span className="text-primary-600 font-bold">{filteredConnections.length}</span> {filteredConnections.length === 1 ? "connection" : "connections"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-300"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Connections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnections.map((connection, index) => {
            const { _id, firstName, lastName, photoUrl, age, gender, about } = connection;

            return (
              <div
                key={_id}
                className="card-base group overflow-hidden hover-lift animate-slide-up"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                {/* Image Container with Overlay */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-neutral-200 to-neutral-300">
                  <img
                    src={photoUrl || "https://placehold.co/400x300"}
                    alt={`${firstName} ${lastName}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Live Status Badge */}
                  {(() => {
                    const isOn = onlineIds.includes(_id);
                    return (
                      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-300">
                        <div className={`w-2 h-2 rounded-full ${isOn ? "bg-green-500 animate-pulse" : "bg-neutral-400"}`}></div>
                        <span className="text-xs font-bold text-neutral-900">{isOn ? "Online" : "Offline"}</span>
                      </div>
                    );
                  })()}

                  {/* Achievement Badge */}
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="badge-secondary text-xs">🌟 Top Match</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Name & Age */}
                  <div className="mb-3">
                    <h2 className="text-2xl font-bold text-neutral-900">
                      {firstName} {lastName}
                    </h2>
                    {(age || gender) && (
                      <p className="text-sm text-neutral-600 mt-2 font-semibold">
                        {age && <span className="mr-2">🎂 {age} years</span>}
                        {gender && <span>💼 {gender === "male" ? "Male" : "Female"}</span>}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-5 leading-relaxed">
                    "{about || "Passionate developer exploring new opportunities"}"
                  </p>

                  {/* Skills/Tags */}
                  <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full border border-primary-200">
                      💻 Developer
                    </span>
                    <span className="px-3 py-1 bg-accent-100 text-accent-700 text-xs font-semibold rounded-full border border-accent-200">
                      🚀 Active
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {confirmId === _id ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <p className="text-sm font-semibold text-red-700 mb-3 text-center">
                        Remove {firstName} from your connections?
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setConfirmId(null)}
                          disabled={removingId === _id}
                          className="py-2 px-3 rounded-lg bg-white border border-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-50 transition disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRemove(_id)}
                          disabled={removingId === _id}
                          className="py-2 px-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow hover:from-red-600 hover:to-red-700 transition disabled:opacity-50"
                        >
                          {removingId === _id ? "Removing..." : "Yes, Remove"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleMessage(_id)}
                        className="btn-primary flex items-center justify-center gap-2 font-semibold py-3 group-hover:shadow-lg transition-all duration-300"
                      >
                        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                        Message
                      </button>
                      <button
                        onClick={() => setConfirmId(_id)}
                        title="Remove connection"
                        className="flex items-center justify-center gap-2 font-semibold py-3 rounded-xl border-2 border-red-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-300 hover:shadow transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {removeError && (
          <p className="mt-6 text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
            {removeError}
          </p>
        )}

        {/* No Results */}
        {filteredConnections.length === 0 && searchTerm && (
          <div className="text-center py-16">
            <p className="text-2xl font-bold text-neutral-900 mb-2">No connections found</p>
            <p className="text-neutral-600 mb-6">Try adjusting your search filters</p>
            <button
              onClick={() => setSearchTerm("")}
              className="btn-outline"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;
