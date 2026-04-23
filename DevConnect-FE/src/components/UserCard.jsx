import React from "react";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user, onNext }) => {
  const { _id, firstName, about, photoUrl, age, gender } = user;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleSendRequest = async (status) => {
    try {
      setIsLoading(true);
      await axios.post(
        `${BASE_URL}/requests/send/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(_id));
      if (onNext) onNext();
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-pop-in">
      {/* Card Container */}
      <div 
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container with Parallax Effect */}
        <div className="relative h-[650px] overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
          <img
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
            src={photoUrl || "https://placehold.co/400x600"}
            alt={firstName}
          />

          {/* Advanced Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

          {/* Animated Status Badge */}
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-white/30 animate-slide-down">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-neutral-900">Online Now</span>
          </div>

          {/* User Info - On Image with Animation */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform transition-transform duration-500 group-hover:translate-y-0">
            <div className="flex items-baseline gap-3">
              <h2 className="text-5xl font-black drop-shadow-lg">
                {firstName}
              </h2>
              {age && (
                <span className="text-3xl font-bold drop-shadow-lg">{age}</span>
              )}
            </div>
            {gender && (
              <p className="text-base mt-2 text-white/90 drop-shadow-md font-semibold">
                💼 {gender === "male" ? "Male" : "Female"} Developer
              </p>
            )}
          </div>

          {/* Achievement Badges */}
          <div className="absolute top-6 left-6 flex gap-2 animate-slide-right">
            <div className="bg-yellow-400/90 backdrop-blur-md px-3 py-2 rounded-full text-xs font-bold text-neutral-900 shadow-lg">
              ⭐ Top Match
            </div>
          </div>
        </div>

        {/* About Section with Glass Effect */}
        <div className="px-8 py-6 border-t-2 border-gradient-to-r from-primary-200/50 to-transparent bg-gradient-to-br from-white to-neutral-50/50">
          <p className="text-neutral-700 text-base font-medium leading-relaxed line-clamp-3 hover:line-clamp-none transition-all duration-300">
            "{about || "Passionate developer exploring new connections and amazing projects..."}"
          </p>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full border border-primary-200">
              💡 Available
            </span>
            <span className="px-3 py-1 bg-accent-100 text-accent-700 text-xs font-semibold rounded-full border border-accent-200">
              🚀 Open to Projects
            </span>
          </div>
        </div>

        {/* Action Buttons with Advanced Styling */}
        <div className="px-8 py-6 flex gap-3 justify-center bg-gradient-to-t from-neutral-50 to-transparent">
          {/* Pass Button */}
          <button
            disabled={isLoading}
            onClick={() => handleSendRequest("ignored")}
            className="flex-1 group/btn relative overflow-hidden rounded-full px-6 py-4 bg-gradient-to-r from-neutral-200 to-neutral-300 hover:from-red-100 hover:to-red-200 active:scale-95 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg border-2 border-neutral-300/50 hover:border-red-300"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-red-700 font-bold text-lg group-hover/btn:text-red-800 transition-colors duration-300">
              <svg
                className="w-6 h-6 group-hover/btn:rotate-90 transition-transform duration-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.707 6.707a1 1 0 0 0-1.414 1.414L8.586 10l-3.293 3.293a1 1 0 1 0 1.414 1.414L10 11.414l3.293 3.293a1 1 0 0 0 1.414-1.414L11.414 10l3.293-3.293a1 1 0 0 0-1.414-1.414L10 8.586 6.707 6.707z" />
              </svg>
              Pass
            </span>
          </button>

          {/* Like/Interested Button */}
          <button
            disabled={isLoading}
            onClick={() => handleSendRequest("interested")}
            className="flex-1 group/btn relative overflow-hidden rounded-full px-6 py-4 bg-gradient-to-r from-primary-500 via-primary-500 to-accent-500 hover:from-primary-600 hover:via-primary-600 hover:to-accent-600 active:scale-95 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary-500/40 disabled:opacity-50 border-2 border-white/40"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-white font-bold text-lg transition-all duration-300">
              <svg className="w-6 h-6 group-hover/btn:scale-125 transition-transform duration-300 group-hover/btn:animate-float" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
              Like
            </span>
          </button>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-3xl flex items-center justify-center animate-slide-up">
            <div className="text-white text-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-rotate-slow mx-auto mb-3"></div>
              <p className="font-semibold">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
