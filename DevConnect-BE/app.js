const express = require("express");
const connectDB = require("./src/config/database.js");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const path = require("path");
const fs = require("fs");
const initializeSocket = require("./src/utils/socket.js");

// Allow any origin in dev (Replit proxies the frontend); cookies still flow
// because credentials are reflected per-origin.
app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

const authRouter = require("./src/routes/auth.js");
const profileRouter = require("./src/routes/profile.js");
const requestsRouter = require("./src/routes/requests.js");
const userRouter = require("./src/routes/user.js");
const chatRouter = require("./src/routes/chat.js");
const projectsRouter = require("./src/routes/projects.js");

// Mount routers under both `/` (used in dev because Vite proxy strips `/api`)
// and `/api` (used in production where Express serves the frontend on the same
// origin and the browser hits `/api/*` directly).
const mountAll = (base) => {
  app.use(base, authRouter);
  app.use(base, profileRouter);
  app.use(base, requestsRouter);
  app.use(base, userRouter);
  app.use(base, chatRouter);
  app.use(base, projectsRouter);
};
mountAll("/");
mountAll("/api");

// Serve the built React app in production (single-origin deploy: API + sockets
// + static frontend all on one Node server).
const frontendDist = path.join(__dirname, "..", "DevConnect-FE", "dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^\/(?!api|socket\.io).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
  console.log("Serving frontend from", frontendDist);
}

const server = http.createServer(app);
const io = initializeSocket(server);
app.set("io", io);

const PORT = process.env.PORT || 7777;
// Bind to 0.0.0.0 in production so the deployment platform can reach us;
// keep 127.0.0.1 in dev so the Replit workflow port detector behaves.
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

connectDB()
  .then(async () => {
    console.log("Database connected");
    // Reconcile indexes with the current schema: drops indexes that no longer
    // match (e.g. an old compound text+array index) and creates any new ones.
    try {
      const Project = require("./src/models/project.js");
      await Project.syncIndexes();
      console.log("Project indexes synced");
    } catch (e) {
      console.error("Index sync failed:", e.message);
    }
    server.listen(PORT, HOST, () => {
      console.log(`Server is running on ${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
