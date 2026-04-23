import React, { useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";

const Connections = () => {
  const connections = useSelector((store) => store.connections) || [];
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });
      dispatch(addConnections(res?.data?.data || []));
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (connections.length === 0)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <h1 className="text-2xl font-semibold text-gray-500">
          No Connections Found
        </h1>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center space-y-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Connections</h1>

      {connections.map((connection) => {
        const { _id, firstName, lastName, photoUrl, age, gender, about } =
          connection;

        return (
          <div
            key={_id}
            className="bg-white w-full max-w-lg p-6 rounded-3xl shadow-xl flex items-center space-x-6 hover:shadow-2xl hover:scale-105 transform transition-all duration-300"
          >
            <div className="flex-shrink-0">
              <img
                src={photoUrl || "https://placehold.co/150"}
                alt={`${firstName} ${lastName}`}
                className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500"
              />
            </div>

            <div className="flex flex-col flex-1 text-left">
              <h2 className="text-2xl font-semibold text-gray-800">
                {firstName} {lastName}
              </h2>

              {(age || gender) && (
                <p className="text-gray-500 text-sm mt-1">
                  {age ? age : ""} {gender ? "| " + gender : ""}
                </p>
              )}

              <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                {about || "No description available."}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Connections;
