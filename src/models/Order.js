const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
    min: 1,
  },

  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    shippingAddress: {
      type: mongoose.Types.ObjectId,
      ref: "User.addresses",
      required: true,
    },

    postTrackingCode: {
      type: String,
    },

    status: {
      type: String,
      enum: ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"],
      default: "PROCESSING",
    },

    authority: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

orderSchema.virtual("totalPrice").get(function () {
  return this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

const model = mongoose.model("Order", orderSchema);

module.exports = model;
