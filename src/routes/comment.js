const express = require("express");
const controller = require("./../controllers/comment");
const passport = require("passport");
const roleGuard = require("./../middlewares/roleGuard");
const validate = require("./../middlewares/validate");
const {
  createCommentValidator,
  updateCommentValidator,
  addReplyValidator,
  updateReplyValidator,
} = require("./../validations/comment");

const router = express.Router();

router
  .route("/")
  .get(controller.getComments)
  .post(
    passport.authenticate("accessToken", { session: false }),
    validate(createCommentValidator),
    controller.createComment
  );

router
  .route("/all")
  .get(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    controller.getAllComments
  );

router
  .route("/:commentId")
  .patch(
    passport.authenticate("accessToken", { session: false }),
    validate(updateCommentValidator),
    controller.updateComment
  )
  .delete(
    passport.authenticate("accessToken", { session: false }),
    roleGuard("ADMIN"),
    controller.deleteComment
  );

router
  .route("/:commentId/reply")
  .post(
    passport.authenticate("accessToken", { session: false }),
    validate(addReplyValidator),
    controller.createReply
  );

router
  .route("/:commentId/reply/:replyId")
  .patch(
    passport.authenticate("accessToken", { session: false }),
    validate(updateReplyValidator),
    controller.updateReply
  )
  .delete(
    passport.authenticate("accessToken", { session: false }),
    controller.deleteReply
  );

module.exports = router;
