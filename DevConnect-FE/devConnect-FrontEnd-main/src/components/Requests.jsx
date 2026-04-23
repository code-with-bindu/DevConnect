import React, { useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const reviewRequest = async (status, _id) => {
    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/requests/received`, {
          withCredentials: true,
        });
        dispatch(addRequests(res?.data?.data));
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchRequests();
  }, [dispatch]);

  if (!requests) return <h1 className="text-center mt-20">Loading...</h1>;
  if (requests.length === 0)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-semibold text-gray-600">No Requests Found</h1>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-20 px-4 flex flex-col items-center space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Requests</h1>

      {requests.map((request) => {
        const { firstName, lastName, photoUrl, age, gender, about, _id } =
          request.fromUserId;

        return (
          <div
            key={_id}
            className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg flex items-center justify-between space-x-4 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <img
                alt="photo"
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-400"
                src={photoUrl || "https://placehold.co/150"}
              />
              <div className="flex flex-col text-left">
                <h2 className="font-semibold text-xl text-gray-800">
                  {firstName} {lastName}
                </h2>
                {(age || gender) && (
                  <p className="text-gray-500 text-sm">
                    {age ? age : ""} {gender ? "| " + gender : ""}
                  </p>
                )}
                <p className="text-gray-600 mt-1 text-sm line-clamp-3">{about}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                onClick={() => reviewRequest("rejected", request._id)}
              >
                Reject
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                onClick={() => reviewRequest("accepted", request._id)}
              >
                Accept
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Requests;
