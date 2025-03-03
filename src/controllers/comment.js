const response = require("./../utils/response");
const Product = require("./../models/Product");
const Comment = require("./../models/Comment");
const { createPaginationData } = require("./../utils/index");

exports.getComments = async (req, res, next) => {
  try {
    const { productId, limit = 10, page = 1 } = req.query;

    if (!isValidObjectId(productId)) {
      return response(res, 400, "Invalid product ID");
    }

    const product = await Product.findById(productId);

    if (!product) {
      return response(res, 404, "Product not found");
    }

    const comments = await Comment.find({ product: productId })
      .populate("user", "fullname username role createdAt")
      .populate("replies.user", "fullname username role createdAt");

    if (!comments) {
      return response(res, 404, "Comments not found");
    }

    const commentsCount = await Comment.countDocuments();

    const Pagination = createPaginationData(
      page,
      limit,
      commentsCount,
      "Comments"
    );

    const commentsWithRepliesCount = comments.map((comment) => {
      return {
        Pagination,
        ...comment.toObject(),
        repliesCount: comment.replies.length,
      };
    });

    return response(
      res,
      200,
      "Comments fetched successfully",
      commentsWithRepliesCount
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
      .populate("product", "-sellers")
      .populate("user", "-addresses")
      .populate({
        path: "replies",
        populate: { path: "user", sellect: "-addresses" },
      })
      .lean();

    if (!comments) {
      return response(res, 404, "There is no comment !!");
    }

    const commentCount = await Comment.countDocuments();

    const Pagination = createPaginationData(
      page,
      limit,
      commentCount,
      "Comments"
    );

    return response(res, 200, "Comments Fetched Successfully", {
      Pagination,
      Comments: comments,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    // TODO
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    // TODO
  } catch (err) {
    next(err);
  }
};

exports.createReply = async (req, res, next) => {
  try {
    // TODO
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
