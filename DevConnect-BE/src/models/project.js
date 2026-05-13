const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 2000 },
    category: {
      type: String,
      enum: [
        "Hackathon",
        "Unstop Competition",
        "Open Source",
        "Internship",
        "Side Project",
        "Startup",
      ],
      default: "Side Project",
    },
    skillsNeeded: { type: [String], default: [] },
    teamSize: { type: Number, min: 1, max: 50, default: 4 },
    deadline: { type: Date },
    link: { type: String, default: "" },
    location: { type: String, default: "Remote" },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interested: { type: [interestSchema], default: [] },
    tasks: {
      type: [
        new mongoose.Schema(
          {
            text: { type: String, required: true, maxlength: 300 },
            done: { type: Boolean, default: false },
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            assignedTo: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              default: null,
            },
          },
          { timestamps: true }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

projectSchema.index({ title: "text", description: "text" });
projectSchema.index({ skillsNeeded: 1 });
projectSchema.index({ category: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Project", projectSchema);
