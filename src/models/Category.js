const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  filters: {
    type: [
      {
        name: { type: String, required: true, trim: true },
        slug: {
          type: String,
          required: false,
          trim: true,
        },
        description: {
          type: String,
          required: false,
          trim: true,
        },
        type: {
          type: String,
          enum: ["selectbox", "radio", "range"],
          required: true,
        },
        options: {
          type: [String],
          validate: {
            validator: (options) => {return Array.isArray(options)},
          },
        },
        min: {
          type: Number,
        },
        max: {
          type: Number,
        },
      },
    ],
  },
});

const model = mongoose.model("Category", categorySchema);

module.exports = model;
