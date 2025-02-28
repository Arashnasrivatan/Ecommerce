const express = require("express");
const controller = require("./../controllers/product");
const passport = require("passport");
const roleGuard = require("./../middlewares/roleGuard");
const uploader = require("./../middlewares/uploader");
const validate = require("./../middlewares/validate");
const {
  createProductValidator,
  updateProductValidator,
} = require("./../validations/product");

const router = express.Router();

router
  .route("/")
  .post(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    uploader("images", true),
    validate(createProductValidator),
    controller.createProduct
  )
  .get(controller.getAllProducts);

router
  .route("/:productId")
  .get(controller.getOneProduct)
  .patch(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    uploader("images", true),
    validate(updateProductValidator),
    controller.updateProduct
  )
  .delete(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    controller.deleteProduct
  );

module.exports = router;
