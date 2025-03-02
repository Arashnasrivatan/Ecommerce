const express = require("express");
const controller = require("./../controllers/v1/comment");
const { auth } = require("./../middlewares/auth");
const roleGuard = require("./../middlewares/roleGuard");
const validate = require("./../middlewares/validate");
const {
  createCommentValidator,
  updateCommentValidator,
  addReplyValidator,
  updateReplyValidator,
} = require("./../validators/comment");

const router = express.Router();

router
  .route("/")
  .get(controller.getComments)
  .post(auth, validate(createCommentValidator), controller.createComment);

router.route("/all").get(auth, roleGuard("ADMIN"), controller.getAllComments)

router
  .route("/:commentId")
  .patch(auth, validate(updateCommentValidator), controller.updateComment)
  .delete(auth, roleGuard("ADMIN"), controller.deleteComment);

router.route("/:commentId/reply").post(auth, validate(addReplyValidator), controller.createReply);

router
  .route("/:commentId/reply/:replyId")
  .patch(auth, validate(updateReplyValidator), controller.updateReply)
  .delete(auth, controller.deleteReply);

module.exports = router;
