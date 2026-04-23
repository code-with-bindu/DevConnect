import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, removeUserFromFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed) || [];
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(0); // Track current card

  const getFeed = async () => {
    if (feed.length > 0) return;
    try {
      const res = await axios.get(`${BASE_URL}/feed`, { withCredentials: true });
      dispatch(addFeed(res?.data?.data || []));
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  const handleNext = (userId) => {
    dispatch(removeUserFromFeed(userId));
    setCurrentIndex((prev) => prev + 1);
  };

  if (feed.length === 0 || currentIndex >= feed.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-semibold text-gray-600">No Users Found</h1>
      </div>
    );
  }

  const currentUser = feed[currentIndex];

  return (
    <div className="min-h-screen bg-gray-100 py-20 px-4 flex justify-center items-center">
      <UserCard user={currentUser} onNext={() => handleNext(currentUser._id)} />
    </div>
  );
};

export default Feed;
