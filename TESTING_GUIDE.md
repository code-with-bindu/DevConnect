# QUICK START - INSTALLATION & TESTING

## ⚡ INSTALL DEPENDENCIES

### Backend

```bash
cd DevConnect-BE
npm install
# This will add no new packages (socket.io already in package.json)
```

### Frontend

```bash
cd DevConnect-FE
npm install
# This will install socket.io-client (added to package.json)
```

---

## 🚀 START THE SERVERS

### Terminal 1: Backend Server

```bash
cd DevConnect-BE
npm run dev
# Should see:
# Server is running on port 7777
# MongoDB connected
```

### Terminal 2: Frontend Server

```bash
cd DevConnect-FE
npm run dev
# Should see:
# Local:        http://localhost:5173/
```

### Terminal 3: Watch MongoDB (Optional)

```bash
# In mongosh or MongoDB Compass, can watch messages being created
db.messages.watch()
```

---

## 🧪 TESTING THE CHAT SYSTEM

### SETUP

1. Open browser to `http://localhost:5173`
2. Login with two different user accounts in two separate browser windows
3. **User A** browser: Login as User A
4. **User B** browser: Login as User B

### TEST 1: ESTABLISHING CONNECTION

```
USER A:
1. Navigate to "Connections"
2. Find User B in the list
3. Click "Message" button

EXPECTED:
✅ Chat page opens with User B's name at top
✅ "Loading chat..." shows briefly
✅ Says "No messages yet. Start a conversation!"
✅ Browser console shows: "Socket connected"
```

### TEST 2: SEND FIRST MESSAGE

```
USER A:
1. Type: "Hello User B!"
2. Press Enter or click Send
3. Watch the message appear immediately

USER B:
1. Same browser/window
2. Navigate to any page, then to Connections
3. Click Message on User A
4. MAGIC: All messages are there!

EXPECTED:
✅ Message appears instantly on User A's screen
✅ Message shows in User B's chat when opened
✅ Both show same timestamp
✅ Server console: "Message from [userA] saved and emitted"
✅ MongoDB has the message saved
```

### TEST 3: REAL-TIME DELIVERY (Both Online)

```
Setup:
- Both users have chat page open side-by-side

USER A:
1. Type: "Are you there?"
2. Send message

USER B (WATCHING SAME PAGE):
✅ Message appears instantly (< 1 second)
✅ No refresh needed
✅ Shows sender name and timestamp

USER B:
1. Type: "Yes! Got your message!"
2. Send message

USER A (WATCHING SAME PAGE):
✅ Message appears instantly
✅ Shows User B's name
```

### TEST 4: OFFLINE PERSISTENCE

```
USER A:
1. Send message: "I'm sending this while you're offline"
2. Both browsers still have chat page open

USER B:
1. Close the entire browser tab/window
2. Close the browser completely
3. Go outside, take a coffee break ☕
4. Come back and open browser
5. Navigate to chat with User A

EXPECTED:
✅ Chat history loads from database
✅ Sees message from User A
✅ No message lost!
✅ Can continue conversation as if never left
```

### TEST 5: MULTIPLE MESSAGES

```
USER A:
1. Send rapid messages:
   "Message 1"
   "Message 2"  
   "Message 3"
   "Message 4"
   "Message 5"

USER B:
✅ All 5 messages arrive in order
✅ No duplicates
✅ Timestamps in order

USER A (Refresh):
1. Close and reopen chat page
✅ All 5 messages still there (persisted)
```

### TEST 6: VALIDATION

```
USER A:
1. Try sending empty message (just spaces)
2. Try sending very long message

EXPECTED:
✅ Empty message: Alert "Cannot send empty message"
✅ Long message: Should send fine (up to 5000 chars)
```

---

## 🔍 DEBUG & MONITOR

### Browser Console (Frontend Logs)

```javascript
// Should see:
"Socket connected: socket_id_here"
"User 1234 joined room: user1_user2"
"Message received: { text: '...', senderI..." 
```

### Server Console (Backend Logs)

```bash
# When message sent:
Message from 1234 saved and emitted

# When user joins:
User 1234 joined room: user1_user2

# When user online:
User 1234 is online

# Errors (if any):
Error saving message: [error details]
```

### MongoDB (Verify Persistence)

```bash
# Start mongosh
mongosh

# Select database
use devtinder    # or your DB name

# See all messages
db.messages.find()

# See messages between User A and B
db.messages.find({ conversationId: "user_a_id_user_b_id" })

# Count total
db.messages.count()

# Latest message
db.messages.findOne({}, { sort: { createdAt: -1 } })
```

---

## ⚠️ COMMON ISSUES & FIXES

### Issue: "Socket connection error"

```
FIX:
1. Ensure backend running on port 7777
2. Check if BASE_URL in frontend constants.js is correct
3. Check CORS in socket.js has origin "http://localhost:5173"
4. Restart both servers
5. Check browser Network tab for WebSocket connection
```

### Issue: "Cannot GET /chat/messages"

```
FIX:
1. Verify chat router is imported in app.js
2. Check you're authenticated (pass credentials:true)
3. Verify userId in URL is correct format (ObjectId)
```

### Issue: "Loading... forever"

```
FIX:
1. Check if backend is running: http://localhost:7777
2. Check browser Network tab - is request stuck?
3. Check server console for errors
4. Try refreshing page
```

### Issue: "Message appears twice"

```
This is NORMAL temporarily!
- Optimistic message (instant feedback to user)
- Real message from server (after save)

Then they merge. If still seeing duplicates:
1. Refresh page
2. Check browser console for errors
3. Restart servers
```

---

## 📊 TESTING MATRIX

| Feature | User A | User B | Expected |
|---------|--------|--------|----------|
| Send message | Yes | Offline | Save to DB ✓ |
| Real-time | Both online | Both watching | Instant delivery ✓ |
| History | Refresh | - | Messages persist ✓ |
| Validation | Empty msg | Send | Alert ✓ |
| Multiple | Fast sending | Watching | All arrive ✓ |
| Dropdown | Open chat | Open same chat | No conflict ✓ |

---

## 🎯 NEXT: PRODUCTION DEPLOYMENT

### For Deployment (Later)

```bash
# Build frontend
cd DevConnect-FE
npm run build
# Creates: dist/ folder

# Environment variables needed:
MONGODB_URI=your_cloud_db_uri
SOCKET_IO_ORIGIN=your_domain.com

# Use services:
- Backend: Render.com, Railway.app, AWS EC2
- Frontend: Vercel, Netlify
- Database: MongoDB Atlas (cloud)
```

---

## 📝 NOTES

- Refresh page = socket reconnects automatically
- Leave chat page = user removed from room
- Close browser = socket.disconnect fires
- All messages in one place (MongoDB) = easily implement read receipts, search, etc later

---

**HAPPY TESTING! 🚀**

If something doesn't work, check the troubleshooting section first!
