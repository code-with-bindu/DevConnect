import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, removeUserFromFeed } from "../utils/feedSlice";
import { Link } from "react-router-dom";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed) || [];
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const getFeed = async () => {
    if (feed.length > 0) {
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(`${BASE_URL}/feed`, { withCredentials: true });
      const feedData = res?.data?.data || [];
      dispatch(addFeed(feedData));
    } catch (err) {
      console.error("Feed error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  const handleNext = (userId) => {
    dispatch(removeUserFromFeed(userId));
    setCurrentIndex((prev) => prev + 1);
  };

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex items-center justify-center pt-32 px-4">
        <div className="max-w-md w-full animate-slide-up">
          <div className="card-elevated p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">⚠️</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">Oops! Something went wrong</h2>
            <p className="text-neutral-600 mb-6 leading-relaxed">{error}</p>
            <button
              onClick={() => getFeed()}
              className="btn-primary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-xl font-semibold text-neutral-700">Finding awesome developers...</p>
          <p className="text-neutral-500 mt-2">This might take a moment</p>
        </div>
      </div>
    );
  }

  // Empty State (no developers at all)
  if (feed.length === 0 || (!searchTerm.trim() && currentIndex >= feed.length)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex flex-col items-center justify-center px-4 pt-32">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="text-8xl mb-6 animate-float">🎉</div>
          <h1 className="text-4xl md:text-5xl font-black text-gradient mb-4">
            All Caught Up!
          </h1>
          <p className="text-lg text-neutral-600 mb-10 leading-relaxed">
            You've reviewed all available profiles. Check back later or explore your connections!
          </p>
          <div className="space-y-3">
            <Link
              to="/user/connections"
              className="btn-primary block w-full text-center"
            >
              View Connections
            </Link>
            <Link
              to="/"
              className="btn-outline block w-full text-center"
            >
              Back to Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Apply search filter to the feed
  const term = searchTerm.trim().toLowerCase();
  const visibleFeed = term
    ? feed.filter((u) => {
        const full = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
        return (
          full.includes(term) ||
          (u.firstName || "").toLowerCase().includes(term) ||
          (u.lastName || "").toLowerCase().includes(term)
        );
      })
    : feed;

  const safeIndex = Math.min(currentIndex, Math.max(visibleFeed.length - 1, 0));
  const currentUser = visibleFeed[safeIndex];
  const progress = visibleFeed.length
    ? Math.round(((safeIndex + 1) / visibleFeed.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 py-12 pt-32 px-4 md:py-16">
      <div className="section-container">
        {/* Header Section */}
        <div className="text-center mb-10 animate-slide-down">
          <div className="inline-block mb-4">
            <span className="badge-primary">🔥 Discover Mode</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gradient mb-4">
            Discover Developers
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Explore amazing developers in your network and connect with those who match your interests
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10 animate-slide-up">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 rounded-2xl blur opacity-25 group-hover:opacity-60 group-focus-within:opacity-75 transition duration-500"></div>
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-white/40 overflow-hidden">
              <div className="pl-5 pr-2 text-primary-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearchActive(true);
                }}
                placeholder="Search developers by name..."
                className="flex-1 py-4 px-2 text-base md:text-lg text-neutral-800 placeholder-neutral-400 bg-transparent focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSearchActive(false);
                    setCurrentIndex(0);
                  }}
                  className="mr-2 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setSearchActive(true)}
                className="m-2 px-5 md:px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
          {term && (
            <p className="text-sm text-neutral-600 mt-3 text-center">
              Showing <span className="font-bold text-primary-600">{visibleFeed.length}</span>{" "}
              {visibleFeed.length === 1 ? "match" : "matches"} for{" "}
              <span className="font-semibold text-neutral-900">"{searchTerm}"</span>
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {visibleFeed.length > 0 && (
          <div className="max-w-md mx-auto mb-12 animate-slide-up">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-neutral-700">
                Profile {safeIndex + 1} of {visibleFeed.length}
              </span>
              <span className="text-sm font-bold text-primary-600">{progress}%</span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden shadow-sm">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500 rounded-full shadow-lg"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Card Container - Centered with Glass Effect Background */}
        <div className="flex justify-center items-center">
          {currentUser ? (
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
              <UserCard user={currentUser} onNext={() => handleNext(currentUser._id)} />
            </div>
          ) : (
            <div className="card-elevated p-10 text-center max-w-md w-full animate-slide-up">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">No developers found</h2>
              <p className="text-neutral-600 mb-6">
                We couldn't find anyone matching{" "}
                <span className="font-semibold text-neutral-900">"{searchTerm}"</span>.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentIndex(0);
                }}
                className="btn-outline"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="text-center mt-12 animate-slide-up">
          <p className="text-neutral-600 font-medium text-lg">
            💡 <span className="text-primary-600 font-bold">Like</span> to connect, <span className="text-red-600 font-bold">Pass</span> to skip
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            Swipe through profiles and find your perfect match
          </p>
        </div>

        {/* Quick Stats */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-3 gap-4 animate-slide-up" style={{animationDelay: "0.2s"}}>
          <div className="card-base p-6 text-center hover-lift">
            <p className="text-3xl font-black text-gradient">{visibleFeed.length}</p>
            <p className="text-sm text-neutral-600 mt-2">{term ? "Matches" : "Developers Found"}</p>
          </div>
          <div className="card-base p-6 text-center hover-lift">
            <p className="text-3xl font-black text-gradient">{Math.min(safeIndex + 1, visibleFeed.length)}</p>
            <p className="text-sm text-neutral-600 mt-2">Current</p>
          </div>
          <div className="card-base p-6 text-center hover-lift">
            <p className="text-3xl font-black text-gradient">{Math.max(visibleFeed.length - safeIndex - 1, 0)}</p>
            <p className="text-sm text-neutral-600 mt-2">Remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
