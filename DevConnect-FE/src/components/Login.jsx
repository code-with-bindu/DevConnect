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
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");
      setIsLoading(true);
      
      if (!emailId || !password) {
        setError("Please enter both email and password");
        setIsLoading(false);
        return;
      }
      
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId: emailId.trim(), password: password.trim() },
        { withCredentials: true }
      );
      
      if (res.data.success || res.data) {
        dispatch(addUser(res.data.data || res.data));
        navigate("/");
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.response?.data || "Login failed";
      console.error("Login error:", errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setError("");
      setIsLoading(true);
      
      if (!firstName || !lastName || !emailId || !password) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }
      
      const res = await axios.post(
        BASE_URL + "/signup",
        { 
          firstName: firstName.trim(), 
          lastName: lastName.trim(), 
          emailId: emailId.trim().toLowerCase(), 
          password: password.trim() 
        },
        { withCredentials: true }
      );
      
      if (res.data.success || res.data.data) {
        dispatch(addUser(res.data.data));
        navigate("/profile/view");
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.response?.data || "Signup failed";
      console.error("Signup error:", errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-50 relative overflow-hidden px-4">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-float" style={{animationDelay: "2s"}}></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="card-elevated p-8 md:p-12 space-y-8 animate-pop-in">
          {/* Logo Section */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl group hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">🧑‍💻</span>
            </div>
            <h1 className="text-4xl font-black text-gradient">DevConnect</h1>
            <p className="text-neutral-600 font-medium">
              {isLoginForm ? "Welcome Back!" : "Join Our Community"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="relative bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl p-4 text-red-700 font-semibold animate-slide-down flex items-start gap-3">
              <span className="text-xl mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form Inputs */}
          <div className="space-y-4">
            {!isLoginForm && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-base w-full transition-all duration-300 hover:bg-white/80 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-base w-full transition-all duration-300 hover:bg-white/80 focus:bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                className="input-base w-full transition-all duration-300 hover:bg-white/80 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base w-full pr-12 transition-all duration-300 hover:bg-white/80 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-600 hover:text-neutral-900 transition-colors duration-300"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={isLoginForm ? handleLogin : handleSignUp}
            disabled={isLoading}
            className="w-full btn-primary py-4 font-bold text-lg rounded-xl relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {isLoginForm ? "🔓 Login" : "✨ Create Account"}
                </>
              )}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
            <span className="text-sm text-neutral-600 font-semibold">Or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
          </div>

          {/* Toggle Form */}
          <button
            onClick={() => {
              setIsLoginForm(!isLoginForm);
              setError("");
            }}
            className="w-full py-3 px-4 bg-neutral-50/50 hover:bg-neutral-100 border-2 border-neutral-200 hover:border-primary-300 text-neutral-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {isLoginForm
              ? "✨ Don't have an account? Sign Up"
              : "🔐 Already have an account? Login"}
          </button>

          {/* Features */}
          <div className="pt-4 border-t border-neutral-200/50 space-y-3">
            <p className="text-xs text-neutral-600 text-center font-semibold mb-4">
              Why join DevConnect?
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-primary-50/50 rounded-lg hover:scale-105 transition-transform duration-300">
                <p className="text-2xl mb-1">👥</p>
                <p className="text-xs font-semibold text-neutral-700">Find Talent</p>
              </div>
              <div className="text-center p-3 bg-accent-50/50 rounded-lg hover:scale-105 transition-transform duration-300">
                <p className="text-2xl mb-1">🚀</p>
                <p className="text-xs font-semibold text-neutral-700">Collaborate</p>
              </div>
              <div className="text-center p-3 bg-secondary-50/50 rounded-lg hover:scale-105 transition-transform duration-300">
                <p className="text-2xl mb-1">💡</p>
                <p className="text-xs font-semibold text-neutral-700">Grow Skills</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-neutral-600 mt-6">
          By {isLoginForm ? "logging in" : "signing up"}, you agree to our{" "}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-300">
            Terms of Service
          </a>{" "}
          &{" "}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-300">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
