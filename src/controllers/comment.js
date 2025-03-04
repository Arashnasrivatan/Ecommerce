const response = require("./../utils/response");
const Product = require("./../models/Product");
const Comment = require("./../models/Comment");
const User = require("./../models/User");
const { createPaginationData } = require("./../utils/index");
const { isValidObjectId } = require("mongoose");

exports.getComments = async (req, res, next) => {
  try {
    const { productId, limit = 10, page = 1 } = req.query;
    if (!productId) return response(res, 400, "productId is required");
    if (!isValidObjectId(productId))
      return response(res, 400, "Invalid product ID");

    const product = await Product.findById(productId);
    if (!product) return response(res, 404, "Product not found");

    const comments = await Comment.find({ product: productId })
      .populate("product", "name")
      .populate("user", "fullname username role")
      .populate("replies.user", "fullname username role")
      .lean();
    if (!comments) return response(res, 404, "Comments not found");

    const commentsCount = await Comment.countDocuments({ product: productId });
    const pagination = createPaginationData(
      page,
      limit,
      commentsCount,
      "Comments"
    );

    const buildReplyTree = (replies, parentId = null) =>
      replies
        .filter((reply) =>
          parentId
            ? reply.replyTo && reply.replyTo.toString() === parentId.toString()
            : !reply.replyTo
        )
        .map((reply) => ({
          ...reply,
          children: buildReplyTree(replies, reply._id),
        }));

    const commentsWithNestedReplies = comments.map((comment) => {
      const nestedReplies = buildReplyTree(comment.replies);
      return {
        ...comment,
        replies: nestedReplies,
        repliesCount: comment.replies.length,
        pagination,
      };
    });

    return response(
      res,
      200,
      "Comments fetched successfully",
      commentsWithNestedReplies
    );
  } catch (err) {
    next(err);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const user = req.user;
    const { product, rating, content } = req.body;

    if (!isValidObjectId(product)) {
      return response(res, 400, "Invalid product ID");
    }

    const existingProduct = await Product.findById(product);

    if (!existingProduct) {
      return response(res, 404, "Product not found");
    }

    const comment = await Comment.create({
      user: user._id,
      product,
      rating,
      content,
      replies: [],
    });

    return response(res, 201, "Comment created successfully", comment);
  } catch (err) {
    next(err);
  }
};

exports.getAllComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const comments = await Comment.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("product", "name")
      .populate("user", "fullname username role")
      .populate("replies.user", "fullname username role")
      .lean();
    if (!comments) return response(res, 404, "No comments found");

    const commentCount = await Comment.countDocuments();
    const pagination = createPaginationData(
      page,
      limit,
      commentCount,
      "Comments"
    );

    const buildReplyTree = (replies, parentId = null) =>
      replies
        .filter((reply) =>
          parentId
            ? reply.replyTo && reply.replyTo.toString() === parentId.toString()
            : !reply.replyTo
        )
        .map((reply) => ({
          ...reply,
          children: buildReplyTree(replies, reply._id),
        }));

    const commentsWithNestedReplies = comments.map((comment) => {
      const nestedReplies = buildReplyTree(comment.replies);
      return { ...comment, replies: nestedReplies };
    });

    return response(res, 200, "Comments fetched successfully", {
      pagination,
      comments: commentsWithNestedReplies,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const { content, rating } = req.body;
    const { commentId } = req.params;
    const { user_id } = req.query;
    const isAdmin = req.user.role === "ADMIN";

    let user;
    if (isAdmin && user_id) {
      if (!isValidObjectId(user_id)) {
        return response(res, 400, "Invalid user_id");
      }
      user = await User.findById(user_id);
    } else {
      user = await User.findById(req.user._id);
    }

    if (!user) {
      return response(res, 404, "User not found");
    }
    if (!isValidObjectId(commentId)) {
      return response(res, 400, "Invalid comment id");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return response(res, 404, "comment not found");
    }

    if (
      !isAdmin &&
      req.user._id.trim().toString() != comment.user.trim().toString()
    ) {
      return response(res, 403, "You Dont have access to edit this comment");
    }

    comment.content = content || comment.content;
    comment.rating = rating || comment.rating;

    const updatedComment = await comment.save();

    return response(res, 200, "Comment Updated Successfully", updatedComment);
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
      return response(res, 400, "Invalid comment ID");
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      return response(res, 404, "Comment not found");
    }

    return response(res, 200, "Comment deleted successfully", comment);
  } catch (err) {
    next(err);
  }
};

exports.createReply = async (req, res, next) => {
  try {
    const user = req.user;
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
      return response(res, 400, "Invalid comment ID");
    }

    let comment = await Comment.findById(commentId).select("-product");
    let replyTo = null;

    if (comment) {
      replyTo = null;
    } else {
      comment = await Comment.findOne({ "replies._id": commentId }).select(
        "-product"
      );
      if (!comment) {
        return response(res, 404, "Invalid comment or reply ID");
      }
      replyTo = commentId;
    }

    const newReply = {
      user: user._id,
      content,
      replyTo,
    };

    comment.replies.push(newReply);
    await comment.save();

    return response(res, 201, "Reply created successfully", newReply);
  } catch (err) {
    next(err);
  }
};

exports.updateReply = async (req, res, next) => {
  try {
    // TODO
  } catch (err) {
    next(err);
  }
};

exports.deleteReply = async (req, res, next) => {
  try {
    // TODO
  } catch (err) {
    next(err);
  }
};
