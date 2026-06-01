const { body, param } = require(
  "express-validator"
);

const createCommentValidation = [
  body("postId")
    .trim()
    .notEmpty()
    .withMessage("Post ID is required")
    .isUUID()
    .withMessage("Post ID must be a valid UUID"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 2 })
    .withMessage(
      "Comment must be at least 2 characters"
    ),

  body("parentCommentId")
    .optional()
    .trim()
    .isUUID()
    .withMessage("Parent Comment ID must be a valid UUID"),
];

const updateCommentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 2 })
    .withMessage(
      "Comment must be at least 2 characters"
    ),
];

const commentIdValidation = [
  param("commentId")
    .isUUID()
    .withMessage(
      "Comment ID must be a valid UUID"
    ),
];

const postIdValidation = [
  param("postId")
    .isUUID()
    .withMessage(
      "Post ID must be a valid UUID"
    ),
];

module.exports = {
  createCommentValidation,
  updateCommentValidation,
  commentIdValidation,
  postIdValidation,
};