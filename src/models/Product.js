const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    SubCategory: {
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
    price: {
      type: Number,
      required: true,
    },
    filterValues: {
      type: Map,
      of: String,
      required: true,
    },
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

ProductSchema.pre("validate", async function (next) {
  try {
    const subSubCategory = await mongoose
      .model("SubCategory")
      .findById(this.SubCategory)
      .populate({
        path: "parent",
        populate: {
          path: "parent",
          model: "Category",
        },
      });

    const allFilters = [];

    if (subSubCategory.filters) {
      allFilters.push(...subSubCategory.filters);
    }

    if (subSubCategory.parent?.filters) {
      allFilters.push(...subSubCategory.parent.filters);
    }

    if (subSubCategory.parent?.parent?.filters) {
      allFilters.push(...subSubCategory.parent.parent.filters);
    }

    for (const [filterName, filterValue] of this.filterValues) {
      const filterDefinition = allFilters.find((f) => f.name === filterName);

      if (!filterDefinition) {
        throw new Error(
          `Filter '${filterName}' is not allowed in this category.`
        );
      }

      switch (filterDefinition.type) {
        case "selectbox":
        case "radio":
          if (
            !Array.isArray(filterDefinition.options) ||
            filterDefinition.options.length === 0
          ) {
            throw new Error(
              `Filter '${filterName}' does not have valid options.`
            );
          }
          if (!filterValue || !filterDefinition.options.includes(filterValue)) {
            throw new Error(
              `Value '${filterValue}' is not allowed for filter '${filterName}'.`
            );
          }
          break;

        case "range":
          const numericValue = Number(filterValue);
          if (isNaN(numericValue)) {
            throw new Error(
              `Value '${filterValue}' for filter '${filterName}' must be a number.`
            );
          }
          if (
            numericValue < filterDefinition.min ||
            numericValue > filterDefinition.max
          ) {
            throw new Error(
              `Value '${filterValue}' for filter '${filterName}' must be between ${filterDefinition.min} and ${filterDefinition.max}.`
            );
          }
          break;

        default:
          throw new Error(
            `Filter type '${filterDefinition.type}' is not supported.`
          );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});
module.exports = mongoose.model("Product", ProductSchema);
