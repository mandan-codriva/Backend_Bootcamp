
const {
  param,
  query,
} = require("express-validator");

const creatorIdValidation = [
  param("creatorId")
    .trim()
    .notEmpty()
    .withMessage(
      "Creator ID is required"
    )
    .isUUID()
    .withMessage(
      "Creator ID must be a valid UUID"
    ),
];

const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "Page must be a positive integer"
    ),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage(
      "Limit must be between 1 and 50"
    ),
];

module.exports = {
  creatorIdValidation,
  paginationValidation,
};

