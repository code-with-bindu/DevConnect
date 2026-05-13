const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const Project = require("../models/project.js");
const ProjectMessage = require("../models/projectMessage.js");

const router = express.Router();

const USER_PUBLIC = "firstName lastName photoUrl";

// Helper: is user the owner OR an accepted member of the project?
const isTeamMember = (project, userId) => {
  const uid = String(userId);
  if (String(project.createdBy?._id || project.createdBy) === uid) return true;
  return project.interested?.some(
    (i) => String(i.user?._id || i.user) === uid && i.status === "accepted"
  );
};

// Helper: ids of everyone on the team (owner + accepted)
const teamUserIds = (project) => {
  const ids = [String(project.createdBy?._id || project.createdBy)];
  for (const i of project.interested || []) {
    if (i.status === "accepted") ids.push(String(i.user?._id || i.user));
  }
  return ids;
};

// Create a project
router.post("/projects", userAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skillsNeeded,
      teamSize,
      deadline,
      link,
      location,
    } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Title and description are required" });
    }

    const project = await Project.create({
      title,
      description,
      category,
      skillsNeeded: Array.isArray(skillsNeeded)
        ? skillsNeeded.map((s) => String(s).trim()).filter(Boolean)
        : String(skillsNeeded || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      teamSize: teamSize ? Number(teamSize) : 4,
      deadline: deadline ? new Date(deadline) : undefined,
      link: link || "",
      location: location || "Remote",
      createdBy: req.user._id,
    });

    const populated = await project.populate("createdBy", USER_PUBLIC);

    // Real-time: broadcast to everyone that a new project was posted
    const io = req.app.get("io");
    if (io) {
      io.emit("projectActivity", {
        kind: "created",
        projectId: populated._id,
        title: populated.title,
        category: populated.category,
        by: {
          _id: populated.createdBy._id,
          firstName: populated.createdBy.firstName,
          photoUrl: populated.createdBy.photoUrl,
        },
        at: new Date(),
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// List projects with optional filters: ?q=&category=&skill=&mine=true
router.get("/projects", userAuth, async (req, res) => {
  try {
    const { q, category, skill, mine } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (skill) filter.skillsNeeded = { $in: [new RegExp(`^${skill}$`, "i")] };
    if (mine === "true") filter.createdBy = req.user._id;
    if (q) {
      const safe = String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(safe, "i");
      filter.$or = [{ title: re }, { description: re }, { skillsNeeded: re }];
    }

    const projects = await Project.find(filter)
      .populate("createdBy", USER_PUBLIC)
      .populate("interested.user", USER_PUBLIC)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get one project
router.get("/projects/:id", userAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", USER_PUBLIC)
      .populate("interested.user", USER_PUBLIC);
    if (!project)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Toggle "I'm interested" / withdraw interest
router.post("/projects/:id/interest", userAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Not found" });
    if (project.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You can't express interest in your own project",
      });
    }

    const idx = project.interested.findIndex(
      (i) => i.user.toString() === req.user._id.toString()
    );
    let action;
    if (idx >= 0) {
      project.interested.splice(idx, 1);
      action = "withdrew";
    } else {
      project.interested.push({
        user: req.user._id,
        message: req.body?.message || "",
      });
      action = "applied";
    }
    await project.save();
    const populated = await project.populate([
      { path: "createdBy", select: USER_PUBLIC },
      { path: "interested.user", select: USER_PUBLIC },
    ]);

    // Real-time: notify owner + broadcast activity
    const io = req.app.get("io");
    if (io && action === "applied") {
      io.emitToUser(populated.createdBy._id.toString(), "projectInterest", {
        projectId: populated._id,
        title: populated.title,
        applicant: {
          _id: req.user._id,
          firstName: req.user.firstName,
          photoUrl: req.user.photoUrl,
        },
        at: new Date(),
      });
      io.emit("projectActivity", {
        kind: "applied",
        projectId: populated._id,
        title: populated.title,
        by: {
          _id: req.user._id,
          firstName: req.user.firstName,
          photoUrl: req.user.photoUrl,
        },
        at: new Date(),
      });
    }

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Owner: accept/reject an interest
router.post(
  "/projects/:id/interest/:userId/:decision",
  userAuth,
  async (req, res) => {
    try {
      const { id, userId, decision } = req.params;
      if (!["accepted", "rejected"].includes(decision))
        return res
          .status(400)
          .json({ success: false, message: "Invalid decision" });
      const project = await Project.findById(id);
      if (!project)
        return res.status(404).json({ success: false, message: "Not found" });
      if (project.createdBy.toString() !== req.user._id.toString())
        return res
          .status(403)
          .json({ success: false, message: "Only owner can decide" });
      const entry = project.interested.find((i) => i.user.toString() === userId);
      if (!entry)
        return res
          .status(404)
          .json({ success: false, message: "Interest not found" });
      entry.status = decision;
      await project.save();
      const populated = await project.populate([
        { path: "createdBy", select: USER_PUBLIC },
        { path: "interested.user", select: USER_PUBLIC },
      ]);

      // Real-time: notify the applicant of the decision
      const io = req.app.get("io");
      if (io) {
        io.emitToUser(userId, "projectDecision", {
          projectId: populated._id,
          title: populated.title,
          decision,
          owner: {
            _id: populated.createdBy._id,
            firstName: populated.createdBy.firstName,
            photoUrl: populated.createdBy.photoUrl,
          },
          at: new Date(),
        });
      }

      res.json({ success: true, data: populated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// ============================================================
// TEAM WORKSPACE: tasks + group chat (members only)
// ============================================================

// GET full workspace bundle (members + tasks + last 50 messages)
router.get("/projects/:id/workspace", userAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", USER_PUBLIC)
      .populate("interested.user", USER_PUBLIC)
      .populate("tasks.createdBy", USER_PUBLIC)
      .populate("tasks.assignedTo", USER_PUBLIC);
    if (!project)
      return res.status(404).json({ success: false, message: "Not found" });
    if (!isTeamMember(project, req.user._id))
      return res
        .status(403)
        .json({ success: false, message: "Members only" });

    const messages = await ProjectMessage.find({ projectId: project._id })
      .populate("senderId", USER_PUBLIC)
      .sort({ createdAt: 1 })
      .limit(200);

    const members = [
      {
        _id: project.createdBy._id,
        firstName: project.createdBy.firstName,
        lastName: project.createdBy.lastName,
        photoUrl: project.createdBy.photoUrl,
        role: "owner",
      },
      ...project.interested
        .filter((i) => i.status === "accepted" && i.user)
        .map((i) => ({
          _id: i.user._id,
          firstName: i.user.firstName,
          lastName: i.user.lastName,
          photoUrl: i.user.photoUrl,
          role: "member",
        })),
    ];

    res.json({
      success: true,
      data: {
        project,
        members,
        tasks: project.tasks || [],
        messages,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Add a task
router.post("/projects/:id/tasks", userAuth, async (req, res) => {
  try {
    const { text, assignedTo } = req.body;
    if (!text || !text.trim())
      return res
        .status(400)
        .json({ success: false, message: "Task text is required" });
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Not found" });
    if (!isTeamMember(project, req.user._id))
      return res
        .status(403)
        .json({ success: false, message: "Members only" });
    project.tasks.push({
      text: text.trim(),
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
    });
    await project.save();
    const populated = await project.populate([
      { path: "tasks.createdBy", select: USER_PUBLIC },
      { path: "tasks.assignedTo", select: USER_PUBLIC },
    ]);
    const newTask = populated.tasks[populated.tasks.length - 1];

    // Notify the team room
    const io = req.app.get("io");
    if (io) {
      io.to(`project:${project._id}`).emit("projectTaskAdded", {
        projectId: project._id,
        task: newTask,
      });
    }
    res.status(201).json({ success: true, data: newTask });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Toggle / update / delete a task
router.patch("/projects/:id/tasks/:taskId", userAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Not found" });
    if (!isTeamMember(project, req.user._id))
      return res
        .status(403)
        .json({ success: false, message: "Members only" });
    const task = project.tasks.id(req.params.taskId);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    if (typeof req.body.done === "boolean") task.done = req.body.done;
    if (typeof req.body.text === "string" && req.body.text.trim())
      task.text = req.body.text.trim();
    if (req.body.assignedTo !== undefined)
      task.assignedTo = req.body.assignedTo || null;
    await project.save();
    const populated = await project.populate([
      { path: "tasks.createdBy", select: USER_PUBLIC },
      { path: "tasks.assignedTo", select: USER_PUBLIC },
    ]);
    const updated = populated.tasks.id(req.params.taskId);

    const io = req.app.get("io");
    if (io) {
      io.to(`project:${project._id}`).emit("projectTaskUpdated", {
        projectId: project._id,
        task: updated,
      });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/projects/:id/tasks/:taskId", userAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Not found" });
    if (!isTeamMember(project, req.user._id))
      return res
        .status(403)
        .json({ success: false, message: "Members only" });
    const task = project.tasks.id(req.params.taskId);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    task.deleteOne();
    await project.save();
    const io = req.app.get("io");
    if (io) {
      io.to(`project:${project._id}`).emit("projectTaskDeleted", {
        projectId: project._id,
        taskId: req.params.taskId,
      });
    }
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Group chat: list messages
router.get("/projects/:id/messages", userAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Not found" });
    if (!isTeamMember(project, req.user._id))
      return res
        .status(403)
        .json({ success: false, message: "Members only" });
    const messages = await ProjectMessage.find({ projectId: project._id })
      .populate("senderId", USER_PUBLIC)
      .sort({ createdAt: 1 })
      .limit(200);
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Group chat: post a message (also broadcast over socket)
router.post("/projects/:id/messages", userAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim())
      return res
        .status(400)
        .json({ success: false, message: "Message text is required" });
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Not found" });
    if (!isTeamMember(project, req.user._id))
      return res
        .status(403)
        .json({ success: false, message: "Members only" });
    const msg = await ProjectMessage.create({
      projectId: project._id,
      senderId: req.user._id,
      text: text.trim(),
    });
    await msg.populate("senderId", USER_PUBLIC);

    // Broadcast to project room
    const io = req.app.get("io");
    if (io) {
      io.to(`project:${project._id}`).emit("projectChatMessage", {
        projectId: project._id,
        message: msg,
      });

      // Plus a toast-style ping to any team member who isn't currently
      // looking at the workspace (uses the per-user emit helper).
      const others = teamUserIds(project).filter(
        (id) => id !== String(req.user._id)
      );
      for (const uid of others) {
        io.emitToUser(uid, "projectChatNotification", {
          projectId: project._id,
          title: project.title,
          sender: {
            _id: req.user._id,
            firstName: req.user.firstName,
            photoUrl: req.user.photoUrl,
          },
          preview: text.trim().substring(0, 100),
          at: new Date(),
        });
      }
    }
    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Owner: delete project
router.delete("/projects/:id", userAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Not found" });
    if (project.createdBy.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ success: false, message: "Only owner can delete" });
    await project.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
