const mongoose = require("mongoose");

const checkoutItemSchema = new mongoose.Schema({
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

const CheckoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [checkoutItemSchema],

    shippingAddress: {
      type: mongoose.Types.ObjectId,
      ref: "User.addresses",
      required: true,
    },

    authority: {
      type: String,
      unique: true
    },

    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 Min
    },
  },
  { timestamps: true }
);

CheckoutSchema.virtual("totalPrice").get(function () {
  return this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

CheckoutSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const model = mongoose.model("Checkout", CheckoutSchema);

module.exports = model;
