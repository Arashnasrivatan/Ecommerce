 const express = require("express");
const controller = require("./../controllers/auth");
const passport = require("passport");
const validate = require("./../middlewares/validate");
const {
  sentSchema,
  verifySchema,
  loginSchema,
  forgotSchema,
  resetSchema,
} = require("./../validations/auth");
const router = express.Router();

router.route("/sent").post(validate(sentSchema), controller.sent);
router.route("/verify").post(validate(verifySchema), controller.verify);

router
  .route("/login")
  .post(
    validate(loginSchema),
    passport.authenticate("local", { session: false }),
    controller.login
  );

router
  .route("/forgot-password")
  .post(validate(forgotSchema), controller.forgotPassword);

router
  .route("/reset-password/:token")
  .post(validate(resetSchema), controller.resetPassword);

router
  .route("/me")
  .get(
    passport.authenticate("accessToken", { session: false }),
    controller.getMe
  );

router
  .route("/refresh")
  .get(
    passport.authenticate("refreshToken", { session: false }),
    controller.refreshToken
  );

router
  .route("/logout")
  .get(
    passport.authenticate("accessToken", { session: false }),
    controller.logout
  );

module.exports = router;
