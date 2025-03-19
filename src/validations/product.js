const { isValidObjectId } = require("mongoose");
const yup = require("yup");

const createProductValidator = yup.object().shape({
  name: yup
    .string()
    .required("Product name is required")
    .min(3, "Product name must be at least 3 characters long")
    .max(100, "Product name cannot exceed 100 characters"),
  description: yup
    .string()
    .required("Product description is required")
    .max(1000, "Product description cannot exceed 1000 characters"),
  subCategory: yup
    .string()
    .required("subCategory ID is required")
    .test(
      "is-valid-objectid",
      "subCategory ID must be a valid ObjectId",
      isValidObjectId
    ),
  stock: yup
    .number()
    .required("Stock is required")
    .min(1, "Stock must be at least 1")
    .max(1000, "Stock cannot exceed 1000"),
  priceInRial: yup
    .number()
    .required("priceInRial is required")
    .min(0, "priceInRial cannot be negative"),
  filterValues: yup
    .array()
    .required()
    .transform((value) => {return JSON.parse(value)})
    .test(
      "filterValuesCheck",
      "filterValues must be an object with key-value pairs",
      (value) => {return value === undefined || typeof value === "object"}
    ),
  customFields: yup
    .array()
    .optional()
    .transform((value) => {return JSON.parse(value)})
    .test(
      "customFieldsCheck",
      "customFields must be an object with key-value pairs",
      (value) => {return value === undefined || typeof value === "object"}
    ),
});

const updateProductValidator = yup.object().shape({
  name: yup
    .string()
    .optional()
    .min(3, "Product name must be at least 3 characters long")
    .max(100, "Product name cannot exceed 100 characters"),
  description: yup
    .string()
    .optional()
    .max(1000, "Product description cannot exceed 1000 characters"),
  subCategory: yup
    .string()
    .optional()
    .test(
      "is-valid-objectid",
      "subCategory ID must be a valid ObjectId",
      (value) => {return value === null || value === undefined || isValidObjectId(value)}
    ),
  stock: yup
    .number()
    .optional()
    .min(1, "Stock must be at least 1")
    .max(1000, "Stock cannot exceed 1000"),
  priceInRial: yup.number().min(0, "priceInRial cannot be negative"),
  filterValues: yup
    .array()
    .optional()
    .transform((value) => {return JSON.parse(value)})
    .test(
      "filterValuesCheck",
      "filterValues must be an object with key-value pairs",
      (value) => {return value === undefined || typeof value === "object"}
    ),
  customFields: yup
    .array()
    .optional()
    .transform((value) => {return JSON.parse(value)})
    .test(
      "customFieldsCheck",
      "customFields must be an object with key-value pairs",
      (value) => {return value === undefined || typeof value === "object"}
    ),
});

module.exports = {
  createProductValidator,
  updateProductValidator,
};
