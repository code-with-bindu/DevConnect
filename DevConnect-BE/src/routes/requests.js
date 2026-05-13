const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const ConnectionRequest = require("../models/connectionRequest.js");
const requestsRouter = express.Router();
const User = require("../models/user.js");

requestsRouter.post(
  "/requests/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type ", status });
      }

      const toUser = await User.findOne({ _id: toUserId });
      if (!toUser) {
        return res.status(400).json({
          messag: "User does not exist",
        });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection Request already exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      // Real-time: notify the recipient when someone is 'interested' in them
      const io = req.app.get("io");
      if (io && status === "interested") {
        io.emitToUser(toUserId.toString(), "connectionRequestNew", {
          fromUser: {
            _id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            photoUrl: req.user.photoUrl,
          },
          at: new Date(),
        });
      }

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }
);

requestsRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const requestId = req.params.requestId;
      const status = req.params.status;
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid status type");
      }
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection Request not found" });
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();

      // Real-time: notify the original sender of the decision
      const io2 = req.app.get("io");
      if (io2) {
        io2.emitToUser(connectionRequest.fromUserId.toString(), "connectionRequestDecision", {
          decision: status,
          by: {
            _id: loggedInUser._id,
            firstName: loggedInUser.firstName,
            photoUrl: loggedInUser.photoUrl,
          },
          at: new Date(),
        });
      }

      res.json({
        message: "Connection Request " + status,
        data,
      });
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }
);

module.exports = requestsRouter;
