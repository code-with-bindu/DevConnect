import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import {
  joinChat,
  sendMessage,
  leaveChat,
  onMessageReceived,
  offMessageReceived,
  onMessageSent,
  offMessageSent,
  initializeSocket,
} from "../utils/socketClient";
import {
  setActiveConversation,
  clearActiveConversation,
} from "../utils/activeConversationSlice";

/**
 * Chat Component
 * 
 * FLOW:
 * 1. Component mounts → Join chat room via socket
 * 2. Fetch old messages from DB
 * 3. Set up listener for new messages
 * 4. User types message → Send via socket
 * 5. Message saved to DB by server
 * 6. Both users receive message instantly (if online)
 * 7. Component unmounts → Leave room, cleanup listeners
 */

const Chat = () => {
  const { userId: targetUserId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((store) => store.user);
  const currentUserId = currentUser?._id;

  // State for messages
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [targetUser, setTargetUser] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // Ref to auto-scroll to latest message
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * STEP 1: Initialize socket and join room
   * Also track this as the active conversation for unread tracking
   */
  useEffect(() => {
    if (!currentUserId || !targetUserId) {
      navigate("/user/connections");
      return;
    }

    // Initialize socket (idempotent - only creates once)
    initializeSocket(currentUserId);

    // Join the chat room
    joinChat(currentUserId, targetUserId);

    // Set this as the active conversation (for unread tracking)
    dispatch(setActiveConversation(targetUserId));

    return () => {
      // Leave room when component unmounts
      leaveChat(currentUserId, targetUserId);

      // Clear active conversation
      dispatch(clearActiveConversation());
    };
  }, [currentUserId, targetUserId, navigate, dispatch]);

  /**
   * STEP 2: Fetch chat history from database
   */
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${BASE_URL}/chat/messages/${targetUserId}`,
          {
            withCredentials: true,
            params: {
              limit: 50,
              skip: 0,
            },
          }
        );

        if (response.data.success) {
          setMessages(response.data.data);
          console.log("Chat history loaded:", response.data.data.length);

          // Mark messages as read when chat is opened
          const conversationId = [currentUserId, targetUserId].sort().join("_");
          try {
            const markReadResponse = await axios.put(
              `${BASE_URL}/chat/mark-as-read/${conversationId}`,
              {},
              { withCredentials: true }
            );
            console.log(
              "Messages marked as read:",
              markReadResponse.data.modifiedCount
            );
          } catch (err) {
            console.warn("Could not mark messages as read:", err.message);
          }
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTargetUserData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/user/view?userId=${targetUserId}`,
          {
            withCredentials: true,
          }
        );
        if (response.data?.data?.user) {
          setTargetUser(response.data.data.user);
        }
      } catch (error) {
        console.error("Error fetching target user:", error);
      }
    };

    fetchChatHistory();
    fetchTargetUserData();
  }, [targetUserId]);

  /**
   * STEP 3: Listen for message events (sent and received)
   * 
   * TWO PATHS:
   * A) "messageSent": Message was sent by ME (sender)
   *    - Replace optimistic message with real one (using tempMessageId)
   * B) "messageReceived": Message was sent by THEM (receiver)
   *    - Just add the message to list
   * 
   * This prevents duplicates: sender doesn't get message twice
   */
  useEffect(() => {
    // Handle confirmation message was sent successfully (SENDER PATH)
    const handleMessageSent = (messageData) => {
      console.log("Message confirmed sent:", messageData);

      // Replace optimistic message with real message using tempMessageId
      setMessages((prevMessages) => {
        return prevMessages.map((msg) => {
          if (msg.tempMessageId === messageData.tempMessageId) {
            // Replace optimistic with real
            return {
              ...messageData,
              isOptimistic: false, // No longer optimistic
            };
          }
          return msg;
        });
      });
    };

    // Handle new message received (RECEIVER PATH)
    const handleMessageReceived = (messageData) => {
      console.log("Message received from other user:", messageData);

      // Only add if not already added optimistically (shouldn't happen as receiver)
      setMessages((prevMessages) => {
        // Check if this message already exists by _id
        const exists = prevMessages.some((msg) => msg._id === messageData._id);
        if (exists) {
          return prevMessages; // Already in list, don't add again
        }
        return [...prevMessages, messageData];
      });
    };

    // Setup listeners
    onMessageSent(handleMessageSent);
    onMessageReceived(handleMessageReceived);

    // Cleanup listeners on unmount
    return () => {
      offMessageSent();
      offMessageReceived();
    };
  }, []);

  /**
   * STEP 4: Handle message sending
   * 
   * OPTIMISTIC UI + DEDUPLICATION:
   * 1. Generate temporary message ID
   * 2. Add message to UI immediately (optimistic)
   * 3. Send to server via socket with tempId
   * 4. Server accepts "messageSent" event with real _id and tempId
   * 5. Replace optimistic message (temp_id) with real message (_id)
   * 6. Other users receive via "messageReceived" event
   */
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      alert("Cannot send empty message");
      return;
    }

    try {
      setIsSending(true);

      // Generate unique temp ID for this optimistic message
      const tempMessageId = "temp_" + Date.now() + "_" + Math.random();

      // Optimistically add message to UI
      const optimisticMessage = {
        _id: tempMessageId,
        tempMessageId, // Store for matching with real message
        senderId: {
          _id: currentUserId,
          firstName: currentUser?.firstName,
          lastName: currentUser?.lastName,
        },
        text: messageText.trim(),
        createdAt: new Date().toISOString(),
        isOptimistic: true, // Mark as optimistic
        isRead: false,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setMessageText("");

      // Send to server via socket WITH tempMessageId
      sendMessage(currentUserId, targetUserId, messageText.trim(), tempMessageId);

      console.log("Message sent to server with tempId:", tempMessageId);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle Enter key to send message
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentUserId) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <p className="text-neutral-600 font-medium">Please log in to use chat</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b border-neutral-200 px-4 md:px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/user/connections")}
              className="md:hidden text-neutral-600 hover:text-primary-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {targetUser?.photoUrl && (
              <img
                src={targetUser.photoUrl}
                alt={targetUser.firstName}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-200"
              />
            )}
            <div>
              <h1 className="font-bold text-neutral-900">{targetUser?.firstName} {targetUser?.lastName}</h1>
              <p className="text-xs text-neutral-500">Active now</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/user/connections")}
            className="hidden md:block btn-ghost text-sm"
          >
            ← Back to Connections
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-96">
              <div className="text-center">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-neutral-500">No messages yet</p>
                <p className="text-neutral-400 text-sm mt-1">Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => {
                const isSender = message.senderId._id === currentUserId;
                const isOptimistic = message.isOptimistic;

                return (
                  <div
                    key={message._id}
                    className={`flex ${isSender ? "justify-end" : "justify-start"} animate-slide-up`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl transition-all ${
                        isSender
                          ? "bg-primary-500 text-white rounded-br-none shadow-md"
                          : "bg-neutral-200 text-neutral-900 rounded-bl-none shadow-sm"
                      } ${isOptimistic ? "opacity-60" : ""}`}
                    >
                      <p className="break-words text-sm leading-relaxed">{message.text}</p>
                      <p
                        className={`text-xs mt-1 flex items-center gap-1 ${
                          isSender ? "text-primary-100" : "text-neutral-600"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {isSender && isOptimistic && <span>⏳</span>}
                        {isSender && !isOptimistic && <span>✓</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-neutral-200 px-4 md:px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="input-base flex-1 resize-none max-h-24 text-sm"
            rows="1"
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !messageText.trim()}
            className="btn-primary flex-shrink-0 rounded-full p-3 h-10 w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346273 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654301,3.0486314 1.15159189,3.99101575 L3.03521743,10.4320088 C3.03521743,10.5891061 3.34915502,10.7462035 3.50612381,10.7462035 L16.6915026,11.5316905 C16.6915026,11.5316905 17.1624089,11.5316905 17.1624089,12.0029827 C17.1624089,12.4742748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
