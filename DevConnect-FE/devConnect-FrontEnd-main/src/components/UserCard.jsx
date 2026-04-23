import React from "react";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user, onNext }) => {
  const { _id, firstName, about, photoUrl, age, gender } = user;
  const dispatch = useDispatch();

  const handleSendRequest = async (status) => {
    try {
      await axios.post(`${BASE_URL}/requests/send/${status}/${_id}`, {}, { withCredentials: true });
      dispatch(removeUserFromFeed(_id));
      if (onNext) onNext();
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md hover:shadow-3xl transition-all duration-300">
      <div className="relative">
        <img
          className="w-full h-96 object-cover"
          src={photoUrl || "https://placehold.co/300"}
          alt={firstName}
        />
        {/* Overlay info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <h2 className="text-2xl font-bold">{firstName}</h2>
          {age && gender && (
            <p className="text-sm mt-1">
              {age} | {gender}
            </p>
          )}
        </div>
      </div>
      <div className="p-6 flex flex-col space-y-4">
        <p className="text-gray-700 line-clamp-3">{about}</p>
        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition w-1/2 mr-2"
            onClick={() => handleSendRequest("ignored")}
          >
            Ignore
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition w-1/2 ml-2"
            onClick={() => handleSendRequest("interested")}
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
