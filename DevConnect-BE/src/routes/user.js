const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

userRouter.get("/user/view", userAuth, async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId query parameter is required",
      });
    }

    const user = await User.findById(userId).select(USER_SAFE_DATA);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: user,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error: " + err.message,
    });
  }
});

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);
    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({
      message: "Data fetched successfully",
      data: data,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find connection requests where THIS user is involved
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id }
      ]
    }).select("fromUserId toUserId");

    // Build array of users to exclude: self + users with existing requests with this user
    const usersToExclude = [loggedInUser._id];
    
    connectionRequests.forEach((conn) => {
      // If I sent the request, hide the recipient
      if (conn.fromUserId.toString() === loggedInUser._id.toString()) {
        usersToExclude.push(conn.toUserId);
      }
      // If I received the request, hide the sender
      else {
        usersToExclude.push(conn.fromUserId);
      }
    });

    // Get available users for feed
    const users = await User.find({
      _id: { $nin: usersToExclude }
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({
      message: "Data fetched successfully",
      data: users,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});
// Search any user by name (across the whole platform).
// Useful for finding people who are already in your connections.
userRouter.get("/users/search", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const q = (req.query.q || "").toString().trim();
    if (!q) {
      return res.json({ message: "ok", data: [] });
    }
    // Escape regex special chars
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");

    const users = await User.find({
      _id: { $ne: loggedInUser._id },
      $or: [{ firstName: regex }, { lastName: regex }],
    })
      .select(USER_SAFE_DATA)
      .limit(40);

    // Mark which ones are already connections
    const connectionRows = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    }).select("fromUserId toUserId");

    const connectionIds = new Set();
    connectionRows.forEach((r) => {
      const other =
        r.fromUserId.toString() === loggedInUser._id.toString()
          ? r.toUserId.toString()
          : r.fromUserId.toString();
      connectionIds.add(other);
    });

    const data = users.map((u) => ({
      ...u.toObject(),
      isConnection: connectionIds.has(u._id.toString()),
    }));

    res.json({ message: "ok", data });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// Allow removing an existing connection.
userRouter.delete("/user/connections/:userId", userAuth, async (req, res) => {
  try {
    const me = req.user._id;
    const other = req.params.userId;
    const result = await ConnectionRequest.deleteMany({
      status: "accepted",
      $or: [
        { fromUserId: me, toUserId: other },
        { fromUserId: other, toUserId: me },
      ],
    });
    res.json({
      success: true,
      message: "Connection removed",
      deleted: result.deletedCount,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

module.exports = userRouter;
  