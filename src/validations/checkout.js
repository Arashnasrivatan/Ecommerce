const yup = require("yup");
const { isValidObjectId } = require("mongoose");

const createCheckoutValidator = yup.object({
  shippingAddress: yup
    .string()
    .required()
    .test("shippingAddress", "Invalid shipping address", (value) =>
      {return isValidObjectId(value)}
    ),
});

module.exports = {
  createCheckoutValidator,
};
