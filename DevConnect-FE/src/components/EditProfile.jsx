import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const EditProfile = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    photoUrl: "",
    age: "",
    gender: "",
    about: "",
    openToCollab: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [dirtyFields, setDirtyFields] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        photoUrl: user.photoUrl || "",
        age: user.age || "",
        gender: user.gender || "",
        about: user.about || "",
        openToCollab: !!user.openToCollab,
      });
    }
  }, [user]);

  const markDirty = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setDirtyFields((prev) => ({
      ...prev,
      [name]: value !== (user ? user[name] : ""),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    markDirty(name, value);
  };

  const handlePhotoFile = (file) => {
    setError("");
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG, GIF, or WEBP image.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("Image is too large. Please choose one under 2 MB.");
      return;
    }
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = () => {
      markDirty("photoUrl", reader.result);
      setUploadingPhoto(false);
    };
    reader.onerror = () => {
      setError("Could not read that image. Please try a different file.");
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    handlePhotoFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handlePhotoFile(file);
  };

  const removePhoto = () => {
    markDirty("photoUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
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

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await axios.patch(BASE_URL + "/profile/edit", updatedData, {
        withCredentials: true,
      });

      dispatch(addUser(res?.data?.data));
      setSuccess(res?.data?.message || "Profile updated successfully!");
      setLoading(false);

      setTimeout(() => {
        setSuccess("");
        navigate("/profile/view");
      }, 1500);
    } catch (err) {
      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || err.message
      );
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-50 pt-32 px-4">
        <div className="card-elevated p-10 text-center">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-neutral-700 font-semibold">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const previewUrl = form.photoUrl || "https://placehold.co/300x300?text=Photo";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/40 via-white to-accent-50/40 py-12 pt-32 px-4">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-down">
          <span className="badge-primary mb-4 inline-block">✨ Profile Studio</span>
          <h1 className="text-4xl md:text-6xl font-black text-gradient mb-3">
            Edit Your Profile
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Make your profile shine — update your photo, story, and details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 animate-slide-up">
            <div className="card-elevated p-6 md:p-10">
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-medium animate-slide-up">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 font-medium animate-slide-up">
                  {success}
                </div>
              )}

              {/* Photo Uploader */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-neutral-700 mb-3">
                  Profile Photo
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={onDrop}
                  className="relative flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl border-2 border-dashed border-primary-200 bg-gradient-to-br from-primary-50/40 to-accent-50/40 hover:border-primary-400 transition"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur opacity-40"></div>
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="relative w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-semibold text-neutral-800">
                      Upload a profile photo
                    </p>
                    <p className="text-sm text-neutral-500 mb-4">
                      JPG, PNG, GIF or WEBP — up to 2 MB. Drag & drop or browse.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold shadow hover:shadow-lg hover:scale-105 active:scale-95 transition disabled:opacity-60"
                      >
                        {uploadingPhoto ? "Uploading..." : "Choose from File Manager"}
                      </button>
                      {form.photoUrl && (
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-50 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={onFileInputChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Jane"
                    className="input-base px-4 py-3 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="input-base px-4 py-3 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="25"
                    className="input-base px-4 py-3 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="input-base px-4 py-3 w-full"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    About
                  </label>
                  <textarea
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    placeholder="Tell other developers about yourself..."
                    rows={4}
                    className="input-base px-4 py-3 w-full resize-none"
                  />
                </div>
              </div>

              {/* Open to Collab toggle */}
              <div className="mt-6 p-4 rounded-2xl border border-accent-200 bg-gradient-to-r from-accent-50/60 to-primary-50/60 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-neutral-800 flex items-center gap-2">
                    <span className="text-lg">🤝</span> Open to Collaborate
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Show a badge on your profile letting others know you're actively looking for team projects.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newVal = !form.openToCollab;
                    setForm((p) => ({ ...p, openToCollab: newVal }));
                    setDirtyFields((p) => ({ ...p, openToCollab: newVal !== !!user?.openToCollab }));
                  }}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
                    form.openToCollab ? "bg-gradient-to-r from-primary-500 to-accent-500" : "bg-neutral-300"
                  }`}
                >
                  <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${form.openToCollab ? "left-8" : "left-1"}`} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 text-white font-bold text-base shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save Profile"}
                </button>
                <button
                  onClick={() => navigate("/profile/view")}
                  className="px-6 py-3.5 rounded-xl bg-white border-2 border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="lg:sticky lg:top-28">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/30 to-accent-500/30 rounded-3xl blur-2xl"></div>
                <div className="relative card-elevated overflow-hidden">
                  <div className="h-28 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600"></div>
                  <div className="px-6 pb-8 -mt-16 text-center">
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-xl"
                    />
                    <h3 className="text-2xl font-black text-neutral-900 mt-4">
                      {form.firstName || "Your"} {form.lastName || "Name"}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1 font-medium">
                      {form.age && <span>🎂 {form.age} years</span>}
                      {form.age && form.gender && <span> · </span>}
                      {form.gender && (
                        <span>💼 {form.gender.charAt(0).toUpperCase() + form.gender.slice(1)}</span>
                      )}
                    </p>
                    <p className="text-neutral-600 mt-4 leading-relaxed text-sm italic">
                      "{form.about || "Tell the world a little about yourself..."}"
                    </p>
                    <div className="flex justify-center gap-2 mt-5">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full border border-primary-200">
                        💻 Developer
                      </span>
                      <span className="px-3 py-1 bg-accent-100 text-accent-700 text-xs font-semibold rounded-full border border-accent-200">
                        🌟 DevConnect
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-neutral-500 mt-4">
                Live preview · Updates as you type
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
