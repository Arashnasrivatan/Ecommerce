const yup = require("yup");
const { isValidObjectId } = require("mongoose");

const addToCartValidator = yup.object({
  productId: yup
    .string()
    .required("Product ID is required")
    .test("is-valid-object-id", "Invalid product ID", (value) =>
      isValidObjectId(value)
    ),
  quantity: yup
    .number()
    .typeError("Quantity must be a positive integer")
    .transform((value, originalValue) => {
      return originalValue === "" ? null : Number(originalValue);
    })
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100")
    .required("Quantity is required")
    .positive("Quantity must be a positive number")
    .integer("Quantity must be a positive integer"),
});

const removeFromCartValidator = yup.object({
  productId: yup
    .string()
    .required("Product ID is required")
    .test("is-valid-object-id", "Invalid product ID", (value) =>
      isValidObjectId(value)
    ),
});

const updateCartValidator = yup.object({
  productId: yup
    .string()
    .required("Product ID is required")
    .test("is-valid-object-id", "Invalid product ID", (value) =>
      isValidObjectId(value)
    ),
  quantity: yup
    .number()
    .typeError("Quantity must be a positive integer")
    .transform((value, originalValue) => {
      return originalValue === "" ? null : Number(originalValue);
    })
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100")
    .required("Quantity is required")
    .positive("Quantity must be a positive number")
    .integer("Quantity must be a positive integer"),
});

module.exports = {
  addToCartValidator,
  removeFromCartValidator,
  updateCartValidator,
};
