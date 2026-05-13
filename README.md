# DevConnect 🚀

**Find Your Dev Team** — A full-stack developer networking and project collaboration platform. Discover developers, form teams, collaborate in real-time, and ship projects together.

---

## Features

### 👥 Developer Discovery
- Swipe-style feed to discover developers by skills
- Like (Interested) or Pass (Ignore) profiles
- Global search for any developer by name
- "Open to Collab" status badge on profiles

### 🤝 Connections
- Send and receive connection requests
- Accept or reject incoming requests
- View your full connections list
- Remove connections any time

### 💬 Real-Time Chat
- 1-to-1 direct messaging with typing indicators
- Online presence tracking (green dot)
- Unread message count badge in nav
- Mark conversations as read

### 📁 Project Hub
- Browse projects by category (Hackathon, Open Source, Startup, etc.)
- Post your own projects with required skills and team size
- **Skill Match Score** — see how well your skills align with a project
- **Quick Apply** — write a pitch and apply in one click
- Confetti burst when you're accepted onto a team 🎉

### 🏠 Project Workspace
- Private team area for accepted members
- Group chat for the whole team
- Shared task board (create, toggle, and track tasks)
- Team member list with roles

### 🔔 Notifications
- Real-time socket-based toast notifications
- Alerts for new connection requests, project applications, and messages

---

## Tech Stack

### Frontend (`DevConnect-FE/`)
| Technology | Purpose |
|---|---|
| React 19 + Vite 7 | UI framework and dev server |
| Redux Toolkit | Global state management |
| React Router v7 | Client-side routing |
| TailwindCSS + DaisyUI | Styling and UI components |
| Socket.io-client | Real-time communication |
| Axios | HTTP requests |

### Backend (`DevConnect-BE/`)
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database and ODM |
| Socket.io | WebSocket server |
| JWT + bcrypt | Authentication and password hashing |
| cookie-parser | HTTP cookie handling |

---

## Project Structure

```
DevConnect/
├── DevConnect-FE/          # React + Vite frontend
│   └── src/
│       ├── components/     # UI components
│       │   ├── Feed.jsx            # Developer discovery feed
│       │   ├── Projects.jsx        # Project hub + Quick Apply
│       │   ├── ProjectWorkspace.jsx# Team workspace (chat + tasks)
│       │   ├── Chat.jsx            # 1-to-1 messaging
│       │   ├── UserCard.jsx        # Profile card
│       │   ├── NavBar.jsx          # Navigation
│       │   ├── Connections.jsx     # Connections list
│       │   ├── Requests.jsx        # Request inbox
│       │   ├── EditProfile.jsx     # Profile editor
│       │   ├── Notifications.jsx   # Notification center
│       │   └── Toaster.jsx         # Real-time toast notifications
│       └── utils/
│           ├── appStore.js         # Redux store
│           ├── constants.js        # API base URL
│           └── socketClient.js     # Socket.io client wrapper
│
└── DevConnect-BE/          # Node.js + Express backend
    ├── app.js              # Express app entry point
    └── src/
        ├── config/
        │   └── database.js         # MongoDB connection
        ├── middlewares/
        │   └── auth.js             # JWT authentication middleware
        ├── models/
        │   ├── user.js             # User schema
        │   ├── connectionRequest.js# Connection request schema
        │   ├── project.js          # Project + tasks schema
        │   ├── message.js          # 1-to-1 chat messages
        │   └── projectMessage.js   # Group chat messages
        ├── routes/
        │   ├── auth.js             # Signup / Login / Logout
        │   ├── profile.js          # View and edit profile
        │   ├── user.js             # Feed, connections, search
        │   ├── requests.js         # Send and review connection requests
        │   ├── chat.js             # 1-to-1 messaging
        │   └── projects.js         # Projects CRUD + workspace
        └── utils/
            ├── socket.js           # Socket.io server setup
            └── validation.js       # Input validation helpers
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- A MongoDB Atlas cluster (or local MongoDB)

### 1. Clone the repo

```bash
git clone https://github.com/code-with-bindu/DevConnect.git
cd DevConnect
```

### 2. Start the Backend

```bash
cd DevConnect-BE
npm install
```

Create a `.env` file in `DevConnect-BE/`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/devConnect
JWT_SECRET=your_jwt_secret_here
PORT=8000
```

```bash
node app.js
# Server running on http://localhost:8000
```

### 3. Start the Frontend

```bash
cd DevConnect-FE
npm install
npm run dev
# App running on http://localhost:5000
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register a new user |
| POST | `/login` | Login and receive JWT cookie |
| POST | `/logout` | Clear auth cookie |

### Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile/view` | Get your profile |
| PATCH | `/profile/edit` | Update profile (name, skills, photo, openToCollab…) |

### Feed & Connections
| Method | Endpoint | Description |
|---|---|---|
| GET | `/feed` | Paginated developer discovery feed |
| GET | `/users/search` | Search developers by name |
| GET | `/user/connections` | Your accepted connections |
| DELETE | `/user/connections/:userId` | Remove a connection |
| GET | `/user/requests/received` | Pending incoming requests |

### Connection Requests
| Method | Endpoint | Description |
|---|---|---|
| POST | `/requests/send/:status/:toUserId` | Send interested / ignored |
| POST | `/request/review/:status/:requestId` | Accept or reject a request |

### Chat
| Method | Endpoint | Description |
|---|---|---|
| GET | `/chat/messages/:userId` | Message history with a user |
| GET | `/chat/conversations` | All active conversations |
| GET | `/chat/unread-count` | Total unread count |
| PUT | `/chat/mark-as-read/:conversationId` | Mark conversation as read |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects` | Browse projects (filter: `q`, `category`, `skill`, `mine`) |
| POST | `/projects` | Create a project |
| POST | `/projects/:id/interest` | Apply to join a project |
| POST | `/projects/:id/interest/:userId/:decision` | Owner: accept or reject applicant |
| GET | `/projects/:id/workspace` | Fetch team workspace (members, tasks, messages) |
| POST | `/projects/:id/tasks` | Create a task |
| PATCH | `/projects/:id/tasks/:taskId` | Toggle/update a task |

---

## Real-Time Events (Socket.io)

| Event | Direction | Description |
|---|---|---|
| `join` | Client → Server | Authenticate and join personal room |
| `send_message` | Client → Server | Send a 1-to-1 chat message |
| `receive_message` | Server → Client | New chat message received |
| `typing` / `stop_typing` | Client → Server | Typing indicator |
| `user_online` / `user_offline` | Server → Client | Presence updates |
| `new_request` | Server → Client | Connection request notification |
| `project_notification` | Server → Client | Project application / decision alert |

---

## Deployment

The app is configured for single-origin production deployment — Express serves both the API and the built React frontend:

```bash
# Build frontend
cd DevConnect-FE && npm run build

# Start server (serves API + static frontend)
cd DevConnect-BE && NODE_ENV=production PORT=8000 node app.js
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `PORT` | No | Server port (default: 7777) |
| `NODE_ENV` | No | Set to `production` for prod mode |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push and open a Pull Request

---

*Built with ❤️ for developers who want to build things together.*
