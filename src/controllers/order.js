const response = require("./../utils/response");
const Order = require("./../models/Order");
const { createPaginationData } = require("./../utils/index");
const { isValidObjectId } = require("mongoose");

exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, user_id = null } = req.query;
    const user = req.user;
    const isAdmin = user.role == "ADMIN";

    const filters = {
      ...(isAdmin ? {} : { user: user._id }),
      ...(user_id ? { user: user_id } : {}),
    };

    const orders = await Order.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("items.product", "name images stock priceInRial")
      .select("-user")
      .lean();

    orders.forEach((order) => {
      order.totalPrice = order.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    });

    const countOrders = await Order.countDocuments(filters);

    const pagination = createPaginationData(page, limit, countOrders, "Orders");

    return response(res, 200, "Orders fetched successfully", {
      pagination,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

// not tested yet | test after complete checkout Controller&Router
exports.updateOrder = async (req, res, next) => {
  try {
    let { postTrackingCode, status } = req.body;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return response(res, 400, "Invalid order ID");
    }

    const order = await Order.findById(id);

    if (!order) {
      return response(res, 404, "Order not found");
    }

    if (postTrackingCode && !status) {
      status = "SHIPPED";
    }

    order.status = status || order.status;
    order.postTrackingCode = postTrackingCode || order.postTrackingCode;

    const updatedOrder = await order.save();

    return response(res, 200, "Order updated successfully :))", {
      updatedOrder,
    });
  } catch (err) {
    next(err);
  }
};
