const mongoose = require("mongoose");

const projectMessageSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true, maxlength: 4000 },
  },
  { timestamps: true }
);

projectMessageSchema.index({ projectId: 1, createdAt: 1 });

module.exports = mongoose.model("ProjectMessage", projectMessageSchema);
