const express = require("express");
const controller = require("./../controllers/v1/cart");
const passport = require("passport");
const validate = require("./../middlewares/validate");
const {
  addToCartValidator,
  removeFromCartValidator,
} = require("./../validations/cart");

const router = express.Router();

router
  .route("/")
  .get(
    passport.authenticate("accessToken", { session: false }),
    controller.getCart
  );

router
  .route("/add")
  .post(
    passport.authenticate("accessToken", { session: false }),
    validate(addToCartValidator, true),
    controller.addToCart
  );

router
  .route("/remove")
  .post(
    passport.authenticate("accessToken", { session: false }),
    validate(removeFromCartValidator),
    controller.removeFromCart
  );

router
  .route("/update")
  .patch(
    passport.authenticate("accessToken", { session: false }),
    validate(addToCartValidator, true),
    controller.updateCart
  );

module.exports = router;
