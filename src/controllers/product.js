const response = require("./../utils/response");
const Product = require("./../models/Product");
const SubCategory = require("./../models/SubCategory");
const path = require("path");
const { isValidObjectId } = require("mongoose");
const mongoose = require("mongoose");
const {
  createPaginationData,
  isSingleKeyObject,
  hasDuplicateKeysInArray,
} = require("./../utils/index");
const sharp = require("sharp");
const fs = require("fs");
const configs = require("./../configs");

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, subCategory, stock, priceInRial } = req.body;

    let { filterValues, customFields } = req.body;

    try {
      filterValues = JSON.parse(filterValues);

      filterValues.forEach((obj) => {
        if (!isSingleKeyObject(obj)) {
          return response(
            res,
            400,
            "filterValues must be an array of single-key objects"
          );
        }
      });

      if (hasDuplicateKeysInArray(filterValues)) {
        return response(res, 400, "filterValues must not have duplicate keys");
      }

      const subSubCategory = await SubCategory.findById(subCategory).populate(
        "parent"
      );

      const allFilters = [];

      if (subSubCategory?.filters) {
        allFilters.push(...subSubCategory.filters);
      }
      if (subSubCategory.parent?.filters) {
        allFilters.push(...subSubCategory.parent.filters);
      }

      for (const filterItem of filterValues) {
        const filterName = Object.keys(filterItem)[0];
        const filterValue = filterItem[filterName];

        const filterDefinition = allFilters.find((f) => {
          return (
            f.name.trim().toLowerCase() === filterName.trim().toLowerCase()
          );
        });

        if (!filterDefinition) {
          return response(
            res,
            400,
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
              return response(
                res,
                400,
                `Filter '${filterName}' does not have valid options.`
              );
            }
            if (
              !filterValue ||
              !filterDefinition.options.includes(filterValue)
            ) {
              return response(
                res,
                400,
                `Value '${filterValue}' is not allowed for filter '${filterName}'.`
              );
            }
            break;

          case "range": {
            const numericValue = Number(filterValue);
            if (isNaN(numericValue)) {
              return response(
                res,
                400,
                `Value '${filterValue}' for filter '${filterName}' must be a number.`
              );
            }
            if (
              numericValue < filterDefinition.min ||
              numericValue > filterDefinition.max
            ) {
              return response(
                res,
                400,
                `Value '${filterValue}' for filter '${filterName}' must be between ${filterDefinition.min} and ${filterDefinition.max}.`
              );
            }
            break;
          }

          default:
            return response(
              res,
              400,
              `Filter type '${filterDefinition.type}' is not supported.`
            );
        }
      }
    } catch (err) {
      console.log(err);
      return response(res, 400, "Invalid filterValues format");
    }

    if (customFields) {
      try {
        customFields = JSON.parse(customFields);

        if (hasDuplicateKeysInArray(customFields)) {
          return response(
            res,
            400,
            "customFields must not have duplicate keys"
          );
        }

        customFields.forEach((obj) => {
          if (!isSingleKeyObject(obj)) {
            return response(
              res,
              400,
              "customFields must be an array of single-key objects"
            );
          }
        });
      } catch (err) {
        console.log(err);
        return response(res, 400, "Invalid customFields format");
      }
    }

    if (!req.files || req.files.length === 0) {
      return response(res, 400, "please upload at least one image");
    }

    const duplicatedName = await Product.findOne({ name });

    if (duplicatedName) {
      return response(res, 400, "a product with this name already exists");
    }

    if (!isValidObjectId(subCategory)) {
      return response(res, 400, "subCategory id is not valid");
    }

    const subcategory = await SubCategory.findById(subCategory);
    if (!subcategory) {
      return response(res, 404, "subcategory not found");
    }

    const uploadDir = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "images",
      "products"
    );
    const images = [];

    try {
      req.files.forEach(async (file) => {
        const fileBuffer = file.buffer;
        const fileName = `${Date.now()}_${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        images.push(`/images/products/${fileName}`);

        await sharp(fileBuffer).png({ quality: 50 }).toFile(filePath);
      });
    } catch (err) {
      console.log(err);
      return response(res, 500, "error uploading file");
    }

    const product = await Product.create({
      name,
      description,
      subCategory,
      stock,
      priceInRial,
      filterValues,
      customFields: customFields || {},
      images,
    });

    return response(res, 201, "product created successfully", product);
  } catch (err) {
    next(err);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      name,
      subCategory,
      minPrice,
      maxPrice,
      filterValues,
      page = 1,
      limit = 15,
    } = req.query;

    const filters = {
      stock: { $gt: 0 },
    };

    if (name) {
      filters.name = { $regex: name, $options: "i" };
    }

    if (subCategory) {
      if (!isValidObjectId(subCategory)) {
        return response(res, 400, "sub category id is not valid");
      }
      const isSubCategoryExist = await SubCategory.findById(subCategory);

      if (!isSubCategoryExist) {
        return response(res, 404, "Sub Category not found");
      }

      filters.subCategory =
        mongoose.Types.ObjectId.createFromHexString(subCategory);
    }

    if (minPrice) {
      filters["priceInRial"] = { $gte: +minPrice };
    }

    if (maxPrice) {
      filters["priceInRial"] = { $lte: +maxPrice };
    }

    if (filterValues) {
      const parsedFilterValues = JSON.parse(filterValues);
      parsedFilterValues.forEach((obj) => {
        if (!isSingleKeyObject(obj)) {
          return response(
            res,
            400,
            "filterValues must be an array of single-key objects"
          );
        }
      });

      if (hasDuplicateKeysInArray(parsedFilterValues)) {
        return response(res, 400, "filterValues must not have duplicate keys");
      }
      Object.keys(parsedFilterValues).forEach((key) => {
        filters[`filterValues.${key}`] = parsedFilterValues[key];
      });
    }

    // TODO add comments and rating
    const products = await Product.aggregate([
      {
        $match: filters,
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "product",
          as: "comments",
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$comments" }, 0] },
              then: { $avg: `$comments.rating` },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          comments: 0,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: +limit,
      },
    ]);

    const totalProducts = await Product.countDocuments(filters);

    return response(res, 200, "Products Fetched Successfully", {
      pagination: createPaginationData(
        +page,
        +limit,
        totalProducts,
        "Products"
      ),
      products,
    });
  } catch (err) {
    next(err);
  }
};

exports.getOneProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return response(res, 400, "Product ID is not valid !!");
    }

    const product = await Product.findById(productId).populate("subCategory");

    if (!product) {
      return response(res, 404, "Product not found !!");
    }

    return response(res, 200, "Product fetched successfully", product);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, description, subCategory, stock, priceInRial } = req.body;

    let { filterValues, customFields } = req.body;
    if (filterValues) {
      filterValues = JSON.parse(filterValues);
    }

    if (!isValidObjectId(productId)) {
      return response(res, 400, "product id is not valid");
    }

    const product = await Product.findById(productId);

    if (!product) {
      return response(res, 404, "product not found");
    }

    if (subCategory) {
      if (!isValidObjectId(subCategory)) {
        return response(res, 400, "Sub Category id is not valid");
      }

      const subcategory = await SubCategory.findById(subCategory).populate(
        "parent"
      );

      if (!subcategory) {
        return response(res, 404, "sub Category not found");
      }

      if (subCategory !== product.subCategory.toString()) {
        const allFilters = [];
        if (subcategory?.filters) {
          allFilters.push(...subcategory.filters);
        }
        if (subcategory.parent?.filters) {
          allFilters.push(...subcategory.parent.filters);
        }

        if (filterValues) {
          try {
            for (const filterItem of filterValues) {
              const filterName = Object.keys(filterItem)[0];
              const filterDefinition = allFilters.find((f) => {
                return (
                  f.name.trim().toLowerCase() ===
                  filterName.trim().toLowerCase()
                );
              });

              if (!filterDefinition) {
                return response(
                  res,
                  400,
                  `Filter '${filterName}' is not allowed in the new category. Please update your filters.`
                );
              }
            }
          } catch (err) {
            console.log(err);
            return response(res, 400, "Invalid filterValues format");
          }
        } else {
          return response(
            res,
            400,
            "The sub-category has changed. Please update your filters."
          );
        }
      }
    }

    if (filterValues) {
      try {
        filterValues.forEach((obj) => {
          if (!isSingleKeyObject(obj)) {
            return response(
              res,
              400,
              "filterValues must be an array of single-key objects"
            );
          }
        });

        if (hasDuplicateKeysInArray(filterValues)) {
          return response(
            res,
            400,
            "filterValues must not have duplicate keys"
          );
        }
        let subSubCategory = null;
        if (subCategory) {
          subSubCategory = await SubCategory.findById(subCategory).populate(
            "parent"
          );
        } else {
          subSubCategory = await SubCategory.findById(
            product.subCategory
          ).populate("parent");
        }

        const allFilters = [];

        if (subSubCategory?.filters) {
          allFilters.push(...subSubCategory.filters);
        }
        if (subSubCategory.parent?.filters) {
          allFilters.push(...subSubCategory.parent.filters);
        }

        for (const filterItem of filterValues) {
          const filterName = Object.keys(filterItem)[0];
          const filterValue = filterItem[filterName];

          const filterDefinition = allFilters.find((f) => {
            return (
              f.name.trim().toLowerCase() === filterName.trim().toLowerCase()
            );
          });

          if (!filterDefinition) {
            return response(
              res,
              400,
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
                return response(
                  res,
                  400,
                  `Filter '${filterName}' does not have valid options.`
                );
              }
              if (
                !filterValue ||
                !filterDefinition.options.includes(filterValue)
              ) {
                return response(
                  res,
                  400,
                  `Value '${filterValue}' is not allowed for filter '${filterName}'.`
                );
              }
              break;

            case "range": {
              const numericValue = Number(filterValue);
              if (isNaN(numericValue)) {
                return response(
                  res,
                  400,
                  `Value '${filterValue}' for filter '${filterName}' must be a number.`
                );
              }
              if (
                numericValue < filterDefinition.min ||
                numericValue > filterDefinition.max
              ) {
                return response(
                  res,
                  400,
                  `Value '${filterValue}' for filter '${filterName}' must be between ${filterDefinition.min} and ${filterDefinition.max}.`
                );
              }
              break;
            }

            default:
              return response(
                res,
                400,
                `Filter type '${filterDefinition.type}' is not supported.`
              );
          }
        }
      } catch (err) {
        console.log(err);

        return response(res, 400, "Invalid filterValues format");
      }
    }

    if (customFields) {
      try {
        customFields = JSON.parse(customFields);

        if (hasDuplicateKeysInArray(customFields)) {
          return response(
            res,
            400,
            "customFields must not have duplicate keys"
          );
        }

        customFields.forEach((obj) => {
          if (!isSingleKeyObject(obj)) {
            return response(
              res,
              400,
              "customFields must be an array of single-key objects"
            );
          }
        });
      } catch (err) {
        console.log(err);
        return response(res, 400, "Invalid customFields format");
      }
    }

    if (name) {
      const duplicatedName = await Product.findOne({
        name,
        _id: { $ne: productId },
      });

      if (duplicatedName) {
        return response(res, 400, "a product with this name already exists");
      }
    }

    const uploadDir = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "images",
      "products"
    );
    const images = [];

    if (req.files) {
      try {
        for (const file of req.files) {
          const fileBuffer = file.buffer;
          const fileName = `${Date.now()}_${file.originalname}`;
          const filePath = path.join(uploadDir, fileName);

          await sharp(fileBuffer).png({ quality: 50 }).toFile(filePath);

          images.push(`/images/products/${fileName}`);
        }
      } catch (err) {
        console.log(err);
        if (images && images.length > 0) {
          for (const image of images) {
            const imagePath = path.join(configs.domain, "public", image);
            try {
              await fs.promises.unlink(imagePath);
            } catch (unlinkErr) {
              console.error(`Failed to delete file: ${imagePath}`, unlinkErr);
            }
          }
        }
        return response(res, 500, "error uploading file");
      }
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.subCategory = subCategory || product.subCategory;
    product.stock = stock || product.stock;
    product.priceInRial = priceInRial || product.priceInRial;
    if (images && images.length > 0) {
      product.images.push(...images);
    }
    product.filterValues = filterValues || product.filterValues;
    product.customFields = customFields || product.customFields;

    const updateProduct = await product.save();

    return response(res, 201, "product updated successfully", updateProduct);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return response(res, 400, "product id is not valid");
    }
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return response(res, 404, "Product not found !!");
    }

    const images = deletedProduct.images;

    images.forEach((image) => {
      const imagePath = path.join(__dirname, "..", "..", "public", image);
      fs.unlinkSync(imagePath);
    });

    // TODO Delete Product from user cart

    return response(res, 200, "Product deleted successfully", deletedProduct);
  } catch (err) {
    next(err);
  }
};
