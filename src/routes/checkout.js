const express = require("express");
const controller = require("./../controllers/checkout");
const passport = require("passport");
const validate = require("./../middlewares/validate");
const { createCheckoutValidator } = require("./../validations/checkout");

const router = express.Router();

router
  .route("/")
  .post(passport.authenticate("accessToken", { session: false }), validate(createCheckoutValidator), controller.createCheckout);
router.route("/verify").get(controller.verifyCheckOut);

module.exports = router;
