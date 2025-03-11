const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  category: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: { type: Number, default: 0 },
  comments: [{ text: String, user: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"], // Add moderation status
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("News", NewsSchema);
