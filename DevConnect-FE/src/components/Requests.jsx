import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { Link } from "react-router-dom";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const reviewRequest = async (status, _id) => {
    try {
      setProcessingId(_id);
      await axios.post(
        `${BASE_URL}/request/review/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (err) {
      console.log(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${BASE_URL}/user/requests/received`, {
          withCredentials: true,
        });
        dispatch(addRequests(res?.data?.data));
      } catch (err) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [dispatch]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-xl font-semibold text-neutral-700">Loading requests...</p>
          <p className="text-neutral-500 mt-2">Getting your connection requests</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!requests || requests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex items-center justify-center px-4 pt-32">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="text-8xl mb-6 animate-float">📬</div>
          <h1 className="text-4xl md:text-5xl font-black text-gradient mb-4">
            No Requests Yet
          </h1>
          <p className="text-lg text-neutral-600 mb-10 leading-relaxed">
            When developers want to connect with you, their requests will appear here
          </p>
          <div className="space-y-3">
            <Link
              to="/"
              className="btn-primary block w-full text-center"
            >
              Discover Developers
            </Link>
            <Link
              to="/user/connections"
              className="btn-outline block w-full text-center"
            >
              View Connections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 py-12 pt-32 px-4 md:py-16">
      <div className="section-container">
        {/* Header */}
        <div className="mb-12 animate-slide-down">
          <div className="inline-block mb-4">
            <span className="badge-primary">📨 Pending Requests</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gradient mb-4">
            Connection Requests
          </h1>
          <p className="text-xl text-neutral-600">
            Review and respond to developers who want to connect with you
          </p>
        </div>

        {/* Request Counter */}
        <div className="mb-8 animate-slide-up">
          <div className="inline-block">
            <div className="px-6 py-3 bg-primary-100/50 border-2 border-primary-300 rounded-full">
              <p className="text-sm font-bold text-primary-700">
                <span className="text-2xl font-black">{requests.length}</span> pending {requests.length === 1 ? "request" : "requests"}
              </p>
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((request, index) => {
            const { firstName, lastName, photoUrl, age, gender, about, _id } =
              request.fromUserId;
            const isProcessing = processingId === request._id;

            return (
              <div
                key={_id}
                className="card-base group overflow-hidden hover-lift animate-slide-up"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                {/* Top Section */}
                <div className="flex gap-6 p-8">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      alt={`${firstName} ${lastName}`}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-primary-200 group-hover:border-primary-400 group-hover:shadow-xl group-hover:shadow-primary-500/30 transition-all duration-300"
                      src={photoUrl || "https://placehold.co/150"}
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-2xl text-neutral-900 truncate">
                      {firstName} {lastName}
                    </h2>
                    {(age || gender) && (
                      <p className="text-sm text-neutral-600 mt-2 font-semibold">
                        {age && <span>🎂 {age} years</span>}
                        {age && gender && <span> • </span>}
                        {gender && <span>💼 {gender === "male" ? "Male" : "Female"}</span>}
                      </p>
                    )}
                    <p className="text-sm text-neutral-600 mt-3 line-clamp-2 leading-relaxed">
                      "{about || "Passionate developer"}"
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-8 py-6 border-t border-neutral-200/50 flex gap-3">
                  <button
                    disabled={isProcessing}
                    onClick={() => reviewRequest("rejected", request._id)}
                    className="flex-1 group/btn py-3 px-4 bg-gradient-to-r from-red-100 to-red-50 hover:from-red-200 hover:to-red-100 border-2 border-red-200 hover:border-red-300 text-red-700 font-bold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-700 rounded-full animate-spin"></div>
                      </>
                    ) : (
                      <>
                        <span className="text-lg group-hover/btn:scale-125 transition-transform duration-300">✕</span>
                        Decline
                      </>
                    )}
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => reviewRequest("accepted", request._id)}
                    className="flex-1 group/btn py-3 px-4 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-secondary-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </>
                    ) : (
                      <>
                        <span className="text-lg group-hover/btn:scale-125 transition-transform duration-300">✓</span>
                        Accept
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        {requests.length > 0 && (
          <div className="mt-16 grid grid-cols-3 gap-4 animate-slide-up" style={{animationDelay: "0.3s"}}>
            <div className="card-base p-6 text-center hover-lift">
              <p className="text-3xl font-black text-gradient">{requests.length}</p>
              <p className="text-sm text-neutral-600 mt-2">Total Requests</p>
            </div>
            <div className="card-base p-6 text-center hover-lift">
              <p className="text-3xl font-black text-gradient">📬</p>
              <p className="text-sm text-neutral-600 mt-2">Pending Response</p>
            </div>
            <div className="card-base p-6 text-center hover-lift">
              <p className="text-3xl font-black text-gradient">⚡</p>
              <p className="text-sm text-neutral-600 mt-2">Quick Action</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
