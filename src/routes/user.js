const express = require("express");
const controller = require("./../controllers/user");
const banController = require("./../controllers/ban");
const passport = require("passport");
const validate = require("./../middlewares/validate");
const {
  profileSchema,
  changeSchema,
  banSchema,
  addAddressSchema,
  updateAddressSchema,
} = require("./../validations/user");
const roleGuard = require("./../middlewares/roleGuard");
const router = express.Router();

//* User Routes

router
  .route("/profile")
  .patch(
    passport.authenticate("accessToken", { session: false }),
    validate(profileSchema),
    controller.editProfile
  );

router
  .route("/change-password")
  .post(
    passport.authenticate("accessToken", { session: false }),
    validate(changeSchema),
    controller.changePassword
  );

//* Ban Routes
router
  .route("/ban")
  .get(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    banController.getAll
  );

router
  .route("/ban/:phone")
  .post(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    validate(banSchema),
    banController.ban
  )
  .delete(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    banController.unban
  );

//* Address Routes
router
  .route("/addresses")
  .get(
    passport.authenticate("accessToken", { session: false }),
    controller.getAddresses
  )
  .post(
    passport.authenticate("accessToken", { session: false }),
    validate(addAddressSchema),
    controller.addAddress
  );

router
  .route("/addresses/:id")
  .patch(
    passport.authenticate("accessToken", { session: false }),
    validate(updateAddressSchema),
    controller.updateAddress
  )
  .delete(
    passport.authenticate("accessToken", { session: false }),
    controller.deleteAddress
  );

module.exports = router;
