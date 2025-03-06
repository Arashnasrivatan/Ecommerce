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
      .populate("items.product", "name images priceInRial")
      .select("-user");

    if (!cart) {
      return response(res, 404, "Cart not found");
    }

    for (let item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product && product.priceInRial !== item.price) {
        item.price = product.priceInRial;
      }
    }

    await cart.save();

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
    const { user_id } = req.query;
    const isAdmin = req.user.role === "ADMIN";
    let user;

    if (isAdmin && user_id) {
      if (!isValidObjectId(user_id)) {
        return response(res, 400, "Invalid user_id");
      }
      user = await User.findById(user_id);
    } else {
      user = req.user;
    }

    if (!user) {
      return response(res, 404, "User not found");
    }

    const { productId } = req.body;
    const quantity = req.validatedBody.quantity;

    const product = await Product.findById(productId);

    if (!product) {
      return response(res, 404, "Product not found");
    }

    if (quantity > product.stock) {
      return response(res, 400, "Requested quantity exceeds available stock");
    }

    const price = product.priceInRial;
    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      const newCart = await Cart.create({
        user: user._id,
        items: [
          {
            product: productId,
            quantity,
            price,
          },
        ],
      });

      return response(res, 201, "Cart created successfully", newCart);
    }

    const index = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (index !== -1) {
      if (cart.items[index].quantity + quantity > 100) {
        return response(res, 400, "Quantity exceeds maximum limit of 100");
      }
      cart.items[index].quantity = quantity + cart.items[index].quantity;
      cart.items[index].price = price;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price,
      });
    }

    for (let item of cart.items) {
      const product = await Product.findById(item.product);
      if (product && product.priceInRial !== item.price) {
        item.price = product.priceInRial;
      }
    }

    await cart.save();

    return response(res, 200, "Cart updated successfully", cart);
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
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
      user = req.user;
    }

    if (!user) {
      return response(res, 404, "User not found");
    }

    const { productId } = req.body;

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return response(res, 404, "Cart not found");
    }

    const index = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (index === -1) {
      return response(res, 404, "Item not found in cart");
    }

    const item = cart.items[index];

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      cart.items.splice(index, 1);
    }

    const updatedCart = await cart.save();

    if (cart.items.length === 0) {
      await cart.deleteOne();
    }

    return response(res, 200, "Item updated in cart successfully", updatedCart);
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
