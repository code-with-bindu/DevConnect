import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { initializeSocket } from "../utils/socketClient";

/**
 * Edge Case Handler Component
 * 
 * CRITICAL ISSUES HANDLED:
 * 1. Multiple socket connections
 * 2. User disconnect/reconnect
 * 3. Lost connections
 * 4. Tab refresh while in chat
 * 5. Prevent duplicate messages
 */

/**
 * ISSUE 1: MULTIPLE SOCKET CONNECTIONS
 * 
 * PROBLEM: If socket connects multiple times, duplicates sent/received
 * 
 * SOLUTION:
 * - In socketClient.js, check if socket already connected (initializeSocket)
 * - Only create socket once per user login
 * - Reuse socket instance across all components
 */

/**
 * ISSUE 2: USER DISCONNECT/RECONNECT
 * 
 * PROBLEM: User loses internet → messages can't send → socket disconnects
 * 
 * SOLUTION:
 * - Socket.io has built-in reconnection: reconnectionAttempts: 5
 * - On reconnect, user emits "userOnline" again
 * - Messages sent while offline are persisted (next sync)
 * - Server tracks active users via activeUsers object
 */

/**
 * ISSUE 3: TAB REFRESH IN CHAT
 * 
 * PROBLEM: User refresh page → socket disconnects → need to rejoin room
 * 
 * SOLUTION:
 * - On Chat component mount, joinChat is called
 * - This works even after refresh (socket is fresh but userId params exist)
 * - Chat history fetched from DB (not lost)
 */

/**
 * ISSUE 4: PREVENT DUPLICATE MESSAGES
 * 
 * PROBLEM: Message sent optimistically, then server emits same message back
 * - Could show message twice
 * 
 * SOLUTION (APPROACH 1 - Current):
 * - Optimistic message has isOptimistic: true flag
 * - When real message arrives from server, merge with optimistic
 * - Or deduplicate by _id
 * 
 * SOLUTION (APPROACH 2 - Advanced):
 * - Generate UUID on client
 * - Send UUID with message to server
 * - Server includes UUID in response
 * - Client merges by UUID instead of creating new
 */

/**
 * ISSUE 5: LEAVING CHAT & CLEANUP
 * 
 * PROBLEM: Leave chat → socket still listening → memory leak
 * 
 * SOLUTION:
 * - useEffect cleanup function calls leaveChat()
 * - leaveChat() emits to server to remove user from room
 * - offMessageReceived() removes socket listener
 * - No lingering connections
 */

/**
 * ISSUE 6: MULTIPLE TABS
 * 
 * PROBLEM: User has chat open in 2 tabs → 2 sockets → conflicts
 * 
 * SOLUTION (CURRENT - SIMPLE):
 * - Socket.io by default allows multiple connections per user
 * - Both tabs get the same socket event
 * - Is this a problem? Maybe not for simple chat
 * 
 * SOLUTION (ADVANCED):
 * - Use localStorage to track socketId
 * - If another tab already has socket for this userId, connect to existing
 * - Use SharedWorkers or localStorage events to sync between tabs
 */

/**
 * ISSUE 7: SCALABILITY - HORIZONTAL SCALING
 * 
 * PROBLEM: Deploy server on 2+ machines
 * - Chat with User A on Server 1
 * - Chat with User B on Server 2
 * - Can they message each other?
 * 
 * SOLUTION: Use Socket.io Adapter
 * - Install: npm install @socket.io/redis-adapter
 * - Connect Socket.io to Redis
 * - Redis broadcasts events across all server instances
 * - Each server sees the same "rooms"
 */

export const EdgeCaseHandler = () => {
  const currentUser = useSelector((store) => store.user);

  /**
   * Initialize socket on app startup
   */
  useEffect(() => {
    if (currentUser?._id) {
      initializeSocket(currentUser._id);
    }

    return () => {
      // Note: Don't disconnect here - it would break chat when switching routes
      // Only disconnect on logout
    };
  }, [currentUser?._id]);

  return null; // This is a handler component, doesn't render anything
};

/**
 * HOW TO USE:
 * 
 * In App.jsx:
 * import { EdgeCaseHandler } from './utils/EdgeCaseHandler';
 * 
 * function App() {
 *   return (
 *     <div>
 *       <EdgeCaseHandler />
 *       <Routes>...</Routes>
 *     </div>
 *   );
 * }
 */

/**
 * PERFORMANCE OPTIMIZATION
 * 
 * 1. MESSAGE PAGINATION
 *    - Don't load ALL messages at once
 *    - Load 50, then "Load More" fetches next 50
 *    - Keeps DOM light
 *
 * 2. AVOID RE-RENDERS
 *    - Use useCallback for handlers
 *    - Memoize Chat component if needed
 *
 * 3. DEBOUNCE TYPING INDICATOR (if added)
 *    - User typing... only update every 1 second
 *    - Not every keystroke
 *
 * 4. IMAGE COMPRESSION
 *    - If sending images via chat
 *    - Compress before upload
 *
 * 5. LAZY LOAD MESSAGES
 *    - Instead of mounting Chat with 1000 messages
 *    - Render only visible messages (virtualization)
 */

/**
 * INTERVIEW TALKING POINTS
 * 
 * 1. "Why Socket.io instead of polling?"
 *    - Polling = wasteful (every 1 sec request)
 *    - Socket = persistent connection (instant push)
 *    - Better for real-time
 *
 * 2. "Why sort user IDs for room?"
 *    - Ensures uniqueness: user1_user2 = user2_user1
 *    - Prevents duplicate rooms
 *    - Important for data integrity
 *
 * 3. "Why save to database?"
 *    - Persistence: offline users get history
 *    - Audit trail: important for compliance
 *    - Can implement read receipts later
 *
 * 4. "How to handle offline users?"
 *    - Messages saved in DB
 *    - When user comes online, fetch history (sync)
 *    - Could implement push notifications
 *
 * 5. "How does scaling work?"
 *    - Single server: socket handles connection
 *    - Multiple servers: need Redis adapter
 *    - Redis pub/sub broadcasts across servers
 */

export default null;
