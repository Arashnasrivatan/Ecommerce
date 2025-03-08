const yup = require("yup");

const updateOrderValidator = yup.object({
  status: yup
    .string()
    .required("Status is required")
    .oneOf(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"]),
  postTrackingCode: yup
    .string()
    .optional("Post tracking code is required")
    .length(24, "postal traking code must be 24 characters"), // iran post status tracking code
});

module.exports = {
  updateOrderValidator,
};
