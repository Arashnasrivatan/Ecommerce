const response = require("./../utils/response");
const Order = require("./../models/Order");
const { createPaginationData } = require("./../utils/index");

// not tested yet
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, user_id = null } = req.query;
    const user = req.user;

    const filters = {
      ...(user.role == "ADMIN" ? {} : { user: user._id }),
      ...(user_id ? { user: user_id } : {}),
    };

    const orders = await Order.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("items.product", "name images priceInRial")
      .select("-user")
      .lean();

    orders.forEach((order) => {
      order.totalPrice = order.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    });

    const countOrders = await Order.countDocuments(filters);

    const pagination = createPaginationData(
      page,
      limit,
      countOrders,
      "Orders"
    );

    return response(res, 200, "Orders fetched successfully", {
      pagination,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    // TODO
  } catch (err) {
    next(err);
  }
};
