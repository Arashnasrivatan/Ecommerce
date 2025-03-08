const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    images: {
      type: [
        {
          type: String,
          required: true,
        },
      ],
    },
    stock: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
    priceInRial: {
      type: Number,
      required: true,
    },
    filterValues: {
      type: Array,
      required: true,
    },
    customFields: {
      type: Array,
    },
  },
  { timestamps: true }
);

const model = mongoose.model("Product", ProductSchema);

module.exports = model;
