const { body, param } = require("express-validator");

const updateProfileValidation = [
  body("fullName")
    .optional()
    .trim()
    .isString()
    .withMessage("Full name must be a string")
    .isLength({ max: 100 })
    .withMessage("Full name cannot exceed 100 characters"),

  body("bio")
    .optional()
    .trim()
    .isString()
    .withMessage("Bio must be a string")
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
];

const userIdValidation = [
  param("userId")
    .isUUID()
    .withMessage("User ID must be a valid UUID"),
];

module.exports = {
  updateProfileValidation,
  userIdValidation,
};
