const response = require("./../utils/response");
const User = require("./../models/User");
const Ban = require("./../models/Ban");
const { createPaginationData } = require("./../utils/index");

exports.getAll = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const banedUsers = await Ban.find({})
      .limit(limit)
      .skip((page - 1) * limit);

    if (!banedUsers || banedUsers.length === 0) {
      return response(res, 404, "No banned users found on this page");
    }

    const totalBanedUsers = await Ban.countDocuments();

    const Pagination = createPaginationData(
      page,
      limit,
      totalBanedUsers,
      "BanedUsers"
    );

    return response(res, 200, "Banned users fetched successfully", {
      pagination,
      banedUsers,
    });
  } catch (err) {
    next(err);
  }
};

exports.ban = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const { banReason } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return response(res, 404, "there is no user with this phone number");
    }

    if (user.role === "ADMIN") {
      return response(res, 400, "you cant ban admins");
    }

    const banedUser = await Ban.create({ phone, banReason });

    await user.deleteOne();

    return response(res, 200, "User Baned Successfully", {
      user,
      banData: banedUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.unban = async (req, res, next) => {
  try {
    const { phone } = req.params;

    const ban = await Ban.findOne({ phone });

    if (!ban) {
      return response(
        res,
        404,
        "there is no Baned User with this phone number"
      );
    }

    await Ban.deleteOne({ phone });

    return response(res, 200, "User unBaned Successfully", {});
  } catch (err) {
    next(err);
  }
};
