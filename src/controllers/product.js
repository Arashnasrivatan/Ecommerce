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

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, subCategory, stock, priceInRial } = req.body;

    let { filterValues, customFields } = req.body;

    if (filterValues) {
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
          return response(
            res,
            400,
            "filterValues must not have duplicate keys"
          );
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

          const filterDefinition = allFilters.find(
            (f) =>
              f.name.trim().toLowerCase() === filterName.trim().toLowerCase()
          );

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

            case "range":
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

            default:
              return response(
                res,
                400,
                `Filter type '${filterDefinition.type}' is not supported.`
              );
          }
        }
      } catch (err) {
        return response(res, 400, "Invalid filterValues format");
      }
    }

    if (customFields) {
      try {
        customFields = JSON.parse(customFields);
        console.log(customFields);

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
        return response(res, 400, "Invalid customFields format");
      }
    }

    if (!isValidObjectId(subCategory)) {
      return response(res, 400, "subCategory id is not valid");
    }

    if (!req.files || req.files.length === 0) {
      return response(res, 400, "please upload at least one image");
    }

    const duplicatedName = await Product.findOne({ name });

    if (duplicatedName) {
      return response(res, 400, "a product with this name already exists");
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
    // TODO
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    // TODO
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    // TODO
  } catch (err) {
    next(err);
  }
};
