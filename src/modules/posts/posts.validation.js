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
];

module.exports = {
  createPostValidation,
};