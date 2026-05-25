const { body } = require(
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

  // body("media")
  //   .optional()
  //   .isArray()
  //   .withMessage("mediaUrls must be an array"),

  // body("media.*")
  //   .isUUID()
  //   .withMessage("Each media URL must be a Valid UUID"),
];

module.exports = {
  createPostValidation,
};