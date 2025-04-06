const response = require("./../utils/response");
const User = require("./../models/User");
const bcrypt = require("bcrypt");
const { isValidObjectId } = require("mongoose");
const { getLocationDetails, isLocationInIran } = require("./../utils/index");

exports.editProfile = async (req, res, next) => {
  try {
    const { fullname, username } = req.body;
    const { user_id } = req.query;
    const isAdmin = req.user.role === "ADMIN";

    if (username) {
      const isUsernameExist = await User.findOne({ username });
      if (isUsernameExist) {
        return response(res, 400, "A user exists with this username");
      }
    }

    let user;
    if (isAdmin && user_id) {
      if (!isValidObjectId(user_id)) {
        return response(res, 400, "Invalid user_id");
      }
      user = await User.findById(user_id).select("-password");
    } else {
      user = await User.findById(req.user._id).select("-password");
    }

    if (!user) {
      return response(res, 404, "User not found");
    }

    if (isAdmin && user_id && user.role === "ADMIN") {
      return response(res, 403, "You cannot edit another admin's profile");
    }

    user.username = username || user.username;
    user.fullname = fullname || user.fullname;

    const updatedUser = await user.save();
    return response(res, 200, "Profile updated successfully", updatedUser);
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isSamePassword = await bcrypt.compare(oldPassword, user.password);

    if (!isSamePassword) {
      return response(res, 400, "old Password is incorect");
    }

    if (!newPassword === confirmPassword) {
      return response(
        res,
        400,
        "new password and confirm password do not match"
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;

    await user.save();
    return response(res, 200, "Password updated successfully");
  } catch (err) {
    next(err);
  }
};