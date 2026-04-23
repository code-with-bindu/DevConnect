import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  };

  const handleSignUp = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.data));
      navigate("/profile/view");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  };

  // 🔹 Choose one gradient option by uncommenting:
  const leftGradient = "bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600"; // Ocean Breeze
  // const leftGradient = "bg-gradient-to-br from-orange-400 via-pink-500 to-red-500"; // Sunset Glow
  // const leftGradient = "bg-gradient-to-br from-purple-500 via-fuchsia-500 to-indigo-600"; // Purple Dream
  // const leftGradient = "bg-gradient-to-br from-green-300 via-lime-400 to-teal-500"; // Minty Fresh

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Left Side - Gradient + Tagline */}
      <div className={`hidden md:flex w-1/2 ${leftGradient} justify-center items-center relative overflow-hidden`}>
        <div className="text-white text-center p-8 z-10">
          <h1 className="text-5xl font-extrabold mb-4 animate-fadeInDown">Connect with Top Devs</h1>
          <p className="text-lg animate-fadeIn delay-150">
            Join the platform and meet amazing developers worldwide.
          </p>
        </div>
        {/* Optional decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-32 -translate-y-32 animate-pulseSlow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-32 translate-y-32 animate-pulseSlow"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6 transition-transform transform hover:scale-105 duration-300">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            {isLoginForm ? "Login" : "Sign Up"}
          </h2>

          {error && (
            <p className="text-red-600 text-center font-semibold animate-shake">{error}</p>
          )}

          <div className="space-y-4">
            {!isLoginForm && (
              <>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email ID"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              className="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
            />
          </div>

          <button
            onClick={isLoginForm ? handleLogin : handleSignUp}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-500"
          >
            {isLoginForm ? "Login" : "Sign Up"}
          </button>

          <p
            className="text-center text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors duration-300"
            onClick={() => setIsLoginForm((prev) => !prev)}
          >
            {isLoginForm
              ? "New User? Sign Up here!"
              : "Already have an account? Login here!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
