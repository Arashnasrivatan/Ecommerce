const response = require("./../utils/response");
const Cart = require("./../models/Cart");
const Product = require("./../models/Product");
const User = require("./../models/User");
const { isValidObjectId } = require("mongoose");

exports.getCart = async (req, res, next) => {
  try {
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

    const cart = await Cart.findOne({ user: user._id })
      .populate("items.product", "name images")
      .select("-user");

    if (!cart) {
      return response(res, 404, "Cart not found");
    }

    return response(res, 200, "Cart Fetched Successfully", {
      cart,
      totalPrice: cart.totalPrice + " IRR",
    });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    // TODO
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    // TODO
  } catch (err) {
    next(err);
  }
};

exports.updateCart = async (req, res, next) => {
  try {
    // TODO
  } catch (err) {
    next(err);
  }
};
