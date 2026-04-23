import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";

/**
 * Notifications / Unread Messages Component
 *
 * Shows:
 * - Users with unread messages
 * - Count of unread messages
 * - Last message preview
 * - Click to open chat and mark as read
 *
 * Similar to WhatsApp, Instagram messaging tabs
 */

const Notifications = () => {
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Fetch unread messages grouped by user
   */
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/chat/unread-per-user`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setUnreadMessages(response.data.data || []);
          console.log(
            "Unread messages fetched:",
            response.data.data.length,
            "users"
          );
        }
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadMessages();
  }, []);

  /**
   * Navigate to chat with user
   * Chat component will automatically mark messages as read
   */
  const handleOpenChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (unreadMessages.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <h1 className="text-2xl font-semibold text-gray-500">
          No unread messages 📭
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600 mt-2">
            You have {unreadMessages.length} unread conversation(s)
          </p>
        </div>

        {/* Unread Messages List */}
        <div className="space-y-4">
          {unreadMessages.map((item) => (
            <div
              key={item.userId}
              onClick={() => handleOpenChat(item.userId)}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 cursor-pointer border-l-4 border-indigo-600"
            >
              {/* User Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      item.userPhoto ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.userId}`
                    }
                    alt={item.userName}
                    className="w-16 h-16 rounded-full border-2 border-indigo-500 object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {item.userName}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {item.lastMessageTime
                        ? new Date(item.lastMessageTime).toLocaleString()
                        : "Unknown time"}
                    </p>
                  </div>
                </div>

                {/* Unread Badge */}
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-full text-lg">
                    {item.unreadCount}
                  </span>
                </div>
              </div>

              {/* Last Message Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 italic line-clamp-2">
                  "{item.lastMessage}"
                </p>
              </div>

              {/* Action Button */}
              <button className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold">
                Open Chat
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
