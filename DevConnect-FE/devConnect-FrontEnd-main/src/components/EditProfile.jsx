import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";

const isValidPhotoUrl = (url) =>
  /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);

const EditProfile = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    photoUrl: user?.photoUrl || "",
    age: user?.age || "",
    gender: user?.gender || "",
    about: user?.about || "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [dirtyFields, setDirtyFields] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setDirtyFields((prev) => ({ ...prev, [name]: value !== user[name] }));
  };

  const saveProfile = async () => {
    const updatedData = {};
    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) updatedData[key] = form[key];
    });

    if (Object.keys(updatedData).length === 0) {
      setError("Please edit at least one field to update your profile.");
      return;
    }

    if (updatedData.photoUrl && !isValidPhotoUrl(updatedData.photoUrl)) {
      setError(
        "Please provide a valid image URL (jpg, jpeg, png, gif, webp)."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        updatedData,
        { withCredentials: true }
      );

      dispatch(addUser(res?.data?.data));
      setSuccess(res?.data?.message || "Profile updated successfully! ✅");
      setLoading(false);

      setTimeout(() => {
        setSuccess("");
        navigate("/profile/view");
      }, 2000);
    } catch (err) {
      setError(err.response?.data || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 p-6 md:p-10 space-y-8 md:space-y-0 md:space-x-8">
      {/* Left Side: Edit Form */}
      <div className="w-full md:w-1/2 bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Edit Profile
        </h2>

        {error && (
          <p className="text-red-500 mb-4 font-medium text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-500 mb-4 font-medium text-center">{success}</p>
        )}

        <div className="space-y-4">
          {/* Floating label input style */}
          {[
            { label: "First Name", name: "firstName", type: "text" },
            { label: "Last Name", name: "lastName", type: "text" },
            { label: "Photo URL", name: "photoUrl", type: "text" },
            { label: "Age", name: "age", type: "number" },
            { label: "Gender", name: "gender", type: "text" },
          ].map((field) => (
            <div key={field.name} className="relative">
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder=" "
                className="w-full px-4 pt-5 pb-2 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
              <label className="absolute top-1 left-4 text-gray-400 text-sm transition-all duration-200 pointer-events-none">
                {field.label}
              </label>
            </div>
          ))}

          {/* About textarea */}
          <div className="relative">
            <textarea
              name="about"
              value={form.about}
              onChange={handleChange}
              placeholder=" "
              rows={4}
              className="w-full px-4 pt-5 pb-2 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
            />
            <label className="absolute top-1 left-4 text-gray-400 text-sm transition-all duration-200 pointer-events-none">
              About
            </label>
          </div>
        </div>

        <button
          onClick={saveProfile}
          disabled={loading}
          className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Right Side: Live Preview Card */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl shadow-lg text-center flex flex-col items-center">
        <div className="relative">
          <img
            src={form.photoUrl || user?.photoUrl || "https://placehold.co/150"}
            alt="profile"
            className="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-indigo-300"
          />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          {form.firstName || user?.firstName} {form.lastName || user?.lastName}
        </h3>
        <p className="text-gray-500 mt-2 text-center">{form.about || user?.about}</p>
        <p className="text-sm text-gray-400 mt-1">
          {form.age || user?.age} | {form.gender || user?.gender}
        </p>
      </div>
    </div>
  );
};

export default EditProfile;
