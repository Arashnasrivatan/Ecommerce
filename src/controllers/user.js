const response = require("./../utils/response");
const User = require("./../models/User");
const bcrypt = require("bcrypt");
const configs = require("./../configs");
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
      user = await User.findById(user_id);
    } else {
      user = await User.findById(req.user._id);
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

exports.getAddresses = async (req, res, next) => {
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
    return response(res, 200, "Addresses found", user.addresses);
  } catch (err) {
    next(err);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const { name, postalCode, location, address } = req.body;
    const { user_id } = req.query;
    const isAdmin = req.user.role === "ADMIN";

    if (!isLocationInIran(location.lat, location.lng)) {
      return response(res, 400, "Location must be within Iran");
    }

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

    const isDuplicateName = user.addresses.some((addr) => addr.name === name);
    const isDuplicatePostalCode = user.addresses.some(
      (addr) => addr.postalCode === postalCode
    );

    if (isDuplicateName) {
      return response(res, 400, "An address with this name already exists");
    }
    if (isDuplicatePostalCode) {
      return response(
        res,
        400,
        "An address with this postal code already exists"
      );
    }

    let locationDetails = await getLocationDetails(location.lat, location.lng);
    if (!locationDetails) {
      locationDetails = null;
    }
    location.formatedLocation = locationDetails.display_name;

    user.addresses.push({
      name,
      postalCode,
      location,
      address,
    });

    await user.save();
    return response(res, 200, "Address added successfully", user.addresses);
  } catch (err) {
    next(err);
  }
};

exports.getAddress = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return response(res, 400, "Invalid ID");
    }

    const addresses = user.addresses.filter(
      (addr) => addr._id == req.params.id
    );

    if (!addresses.length) {
      return response(res, 404, "Address not found");
    }

    return response(res, 200, "Address found successfully", addresses);
  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { name, postalCode, location, address } = req.body;
    const { id } = req.params;
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
    if (!isValidObjectId(id)) {
      return response(res, 400, "Invalid address_id");
    }

    const addressToUpdate = user.addresses.id(id);
    if (!addressToUpdate) {
      return response(res, 404, "Address not found");
    }

    if (name) {
      const isDuplicateName = user.addresses.some(
        (addr) => addr.name === name && addr._id.toString() !== id
      );
      if (isDuplicateName) {
        return response(res, 400, "An address with this name already exists");
      }
      addressToUpdate.name = name;
    }

    if (postalCode) {
      const isDuplicatePostalCode = user.addresses.some(
        (addr) => addr.postalCode === postalCode && addr._id.toString() !== id
      );
      if (isDuplicatePostalCode) {
        return response(
          res,
          400,
          "An address with this postal code already exists"
        );
      }
      addressToUpdate.postalCode = postalCode;
    }

    if (location) {
      if (!isLocationInIran(location.lat, location.lng)) {
        return response(res, 400, "Location must be within Iran");
      }

      let locationDetails = await getLocationDetails(
        location.lat,
        location.lng
      );
      if (!locationDetails) {
        locationDetails = null;
      }
      location.formatedLocation = locationDetails.display_name;
      addressToUpdate.location = location;
    }

    if (address) {
      addressToUpdate.address = address;
    }

    await user.save();
    return response(
      res,
      200,
      "Address updated successfully",
      user.addresses.id(id)
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
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

    if (!isValidObjectId(id)) {
      return response(res, 400, "Invalid address id");
    }

    const addressToDelete = user.addresses.id(id);
    if (!addressToDelete) {
      return response(res, 404, "Address not found");
    }

    user.addresses.pull(addressToDelete);

    await user.save();
    return response(
      res,
      200,
      "Address deleted successfully",
      addressToDelete
    );
  } catch (err) {
    next(err);
  }
};
