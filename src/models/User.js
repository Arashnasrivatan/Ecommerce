const mongoose = require("mongoose");

const AddressesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  postalCode: { type: String, required: true, unique: true },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    formatedLocation: {
      type: String,
      required: false,
    },
  },
  address: { type: String, required: true },
});

const UserSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    addresses: [AddressesSchema],
  },
  { timestamps: true }
);

const model = new mongoose.model("User", UserSchema);

module.exports = model;
