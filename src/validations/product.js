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
    .required("SubCategory ID is required")
    .test(
      "is-valid-objectid",
      "SubCategory ID must be a valid ObjectId",
      isValidObjectId
    ),
  stock: yup
    .number()
    .required("Stock is required")
    .min(1, "Stock must be at least 1")
    .max(1000, "Stock cannot exceed 1000"),
  price: yup
    .number()
    .required("Price is required")
    .min(0, "Price cannot be negative"),
  filterValues: yup
    .object()
    .test(
      "filterValuesCheck",
      "filterValues must be an object with key-value pairs",
      (value) => value === undefined || typeof value === "object"
    ),
  customFields: yup
    .object()
    .test(
      "customFieldsCheck",
      "customFields must be an object with key-value pairs",
      (value) => value === undefined || typeof value === "object"
    ),
});

const updateProductValidator = yup.object().shape({
  name: yup
    .string()
    .min(3, "Product name must be at least 3 characters long")
    .max(100, "Product name cannot exceed 100 characters"),
  description: yup
    .string()
    .max(1000, "Product description cannot exceed 1000 characters"),
  subCategory: yup
    .string()
    .test(
      "is-valid-objectid",
      "SubCategory ID must be a valid ObjectId",
      (value) => value === null || value === undefined || isValidObjectId(value)
    ),
  stock: yup
    .number()
    .min(1, "Stock must be at least 1")
    .max(1000, "Stock cannot exceed 1000"),
  price: yup.number().min(0, "Price cannot be negative"),
  filterValues: yup
    .object()
    .test(
      "filterValuesCheck",
      "filterValues must be an object with key-value pairs",
      (value) => value === undefined || typeof value === "object"
    ),
  customFields: yup
    .object()
    .test(
      "customFieldsCheck",
      "customFields must be an object with key-value pairs",
      (value) => value === undefined || typeof value === "object"
    ),
});

module.exports = {
  createProductValidator,
  updateProductValidator,
};