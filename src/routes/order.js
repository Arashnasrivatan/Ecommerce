const express = require("express");
const controller = require("./../controllers/order");
const passport = require("passport");
const roleGuard = require("./../middlewares/roleGuard");
const validate = require("./../middlewares/validate");
const { updateOrderValidator } = require("./../validations/order");

const router = express.Router();

router
  .route("/")
  .get(
    passport.authenticate("accessToken", { session: false }),
    controller.getAllOrders
  );

router
  .route("/:id")
  .patch(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    validate(updateOrderValidator),
    controller.updateOrder
  );

module.exports = router;
