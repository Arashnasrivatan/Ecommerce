const mongoose = require("mongoose");

const repliesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment.replies",
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    replies: {
      type: [repliesSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
