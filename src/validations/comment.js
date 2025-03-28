const { isValidObjectId } = require("mongoose");
const yup = require("yup");

const createCommentValidator = yup.object().shape({
  product: yup
    .string()
    .required("Product ID is required")
    .test("is-valid-object-id", "Invalid product ID", (value) =>
      {return isValidObjectId(value)}
    ),

  rating: yup.number().required("Rating is required").min(1).max(5),

  content: yup
    .string()
    .required("content is required")
    .max(1000, "Comment content cannot exceed 1000 characters"),
});

const updateCommentValidator = yup.object().shape({
  content: yup
    .string()
    .optional()
    .max(1000, "Comment content cannot exceed 1000 characters"),

  rating: yup.number().min(1).max(5).optional(),
});

const addReplyValidator = yup.object().shape({
  content: yup
    .string()
    .max(1000, "Reply content cannot exceed 1000 characters")
    .required("Reply content is required"),
});

const updateReplyValidator = yup.object().shape({
  content: yup
    .string()
    .max(1000, "Reply content cannot exceed 1000 characters"),
});

module.exports = {
  createCommentValidator,
  updateCommentValidator,
  addReplyValidator,
  updateReplyValidator,
};
