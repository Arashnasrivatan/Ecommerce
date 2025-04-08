const express = require("express");
const controller = require("./../controllers/category");
const subController = require("./../controllers/subCategory");
const passport = require("passport");
const roleGuard = require("./../middlewares/roleGuard");
const validate = require("./../middlewares/validate");
const {
  subCategoryValidator,
  categoryValidator,
  categoryEditValidator,
} = require("./../validations/category");

const router = express.Router();

router
  .route("/")
  .get(controller.fetchAllCategories)
  .post(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    validate(categoryValidator),
    controller.createCategory
  );

router
  .route("/:categoryId")
  .delete(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    controller.deleteCategory
  )
  .patch(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    validate(categoryEditValidator),
    controller.editCategory
  );

//* Sub Sub category Routes
router
  .route("/sub")
  .get(subController.getAllSubCategories)
  .post(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    validate(subCategoryValidator),
    subController.createSubCategory
  );

router
  .route("/sub/:categoryId")
  .get(subController.getSubCategory)
  .delete(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    subController.deleteSubCategory
  )
  .patch(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    subController.editSubCategory
  );

module.exports = router;
