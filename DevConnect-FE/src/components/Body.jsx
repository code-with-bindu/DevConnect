import { useNavigate, Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser, removeUser } from "../utils/userSlice";
import { setUnreadCount, incrementUnread } from "../utils/notificationSlice";
import { useEffect, useRef } from "react";
import { initializeSocket, onNewMessageNotification, offNewMessageNotification } from "../utils/socketClient";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user);
  const activeConversationUserId = useSelector(
    (store) => store.activeConversation?.userId
  );
  const interceptorSetup = useRef(false);

  // Set up axios interceptor for 401 responses
  useEffect(() => {
    if (interceptorSetup.current) return; // Only set up once
    
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // If unauthorized (401), log out the user
        if (error.response && error.response.status === 401) {
          console.log("Unauthorized (401): Logging out user");
          dispatch(removeUser());
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );

    interceptorSetup.current = true;

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [dispatch, navigate]);

  const fetchUser = async () => {
    if (userData) return;
    try {
      const res = await axios.get(`${BASE_URL}/profile/view`, {
        withCredentials: true,
      });
      dispatch(addUser(res?.data));

      // Initialize socket after user is fetched
      if (res?.data?._id) {
        initializeSocket(res.data._id);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/login");
      }
    }
  };

  /**
   * Fetch unread message count on app startup
   * Called after user is authenticated
   */
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/chat/unread-count`, {
        withCredentials: true,
      });

      if (response.data.success) {
        // Update Redux store with unread counts
        dispatch(setUnreadCount(response.data.data));
        console.log(
          "Unread count loaded:",
          response.data.data.totalUnread
        );
      }
    } catch (err) {
      console.warn("Could not fetch unread count:", err.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  /**
   * Redirect to login if user logs out
   * This handles the case where user is on a protected page and logs out
   */
  useEffect(() => {
    // Get current pathname
    const currentPath = window.location.pathname;
    
    // Protected routes that require authentication
    const protectedRoutes = [
      "/user/connections",
      "/user/requests/received",
      "/chat/",
      "/profile/view",
      "/profile/edit",
      "/notifications",
    ];
    
    // Check if current page is protected and user is logged out
    const isOnProtectedPage = protectedRoutes.some(route => currentPath.startsWith(route));
    
    // If user was logged out (userData becomes null/falsy) and they're on a protected page
    if (!userData && isOnProtectedPage) {
      console.log("User logged out, redirecting to login from protected page");
      navigate("/login");
    }
  }, [userData, navigate]);

  /**
   * Initialize socket and fetch unread when user is available
   */
  useEffect(() => {
    if (userData?._id) {
      initializeSocket(userData._id);
      fetchUnreadCount();
    }
  }, [userData?._id]);

  /**
   * Set up real-time listener for new message notifications
   * When a message arrives, increment unread count instantly
   * ONLY INCREMENT if user is NOT in that chat conversation
   */
  useEffect(() => {
    const handleNewMessageNotification = (notificationData) => {
      console.log(
        "New message notification received from:",
        notificationData.senderName
      );

      // Only increment unread if this message is NOT from the active conversation
      if (
        !activeConversationUserId ||
        notificationData.senderId !== activeConversationUserId
      ) {
        // Increment unread count in Redux
        dispatch(incrementUnread({ senderId: notificationData.senderId, count: 1 }));
        console.log("Unread count incremented");
      }
    };

    // Set up listener for notifications
    onNewMessageNotification(handleNewMessageNotification);

    // Cleanup listener on unmount
    return () => {
      offNewMessageNotification();
    };
  }, [dispatch, activeConversationUserId]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      {/* Navbar - Fixed */}
      <NavBar />

      {/* Main content - Add padding-top for fixed navbar */}
      <main className="flex-1 w-full pt-20 md:pt-24">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Body;
