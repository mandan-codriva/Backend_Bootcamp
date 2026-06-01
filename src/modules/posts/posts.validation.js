const { body, param } = require(
  "express-validator"
);

const createPostValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage(
      "Title is required"
    ),

  body("content")
    .trim()
    .notEmpty()
    .withMessage(
      "Content is required"
    ),

  body("status")
    .optional()
    .trim()
    .isIn(["draft", "published", "scheduled", "archived"])
    .withMessage("Status must be one of: draft, published, scheduled, archived"),

  body("category")
    .optional()
    .trim()
    .isString()
    .withMessage("Category must be a string"),

  body("media")
    .optional()
    .isArray()
    .withMessage("Media must be an array"),

  body("media.*")
    .isUUID()
    .withMessage("Each media item must be a valid UUID"),
];

const postIdValidation = [
  param("id")
    .isUUID()
    .withMessage("Post ID must be a valid UUID"),
];

module.exports = {
  createPostValidation,
  postIdValidation,
};