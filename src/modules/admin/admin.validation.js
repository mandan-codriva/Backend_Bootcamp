const { body, param } = require("express-validator");
const { ROLES } = require("../../config/roles");

const adminUserIdParamValidation = [
  param("id")
    .isUUID()
    .withMessage("User ID must be a valid UUID"),
];

const adminPostIdParamValidation = [
  param("id")
    .isUUID()
    .withMessage("Post ID must be a valid UUID"),
];

const adminCommentIdParamValidation = [
  param("id")
    .isUUID()
    .withMessage("Comment ID must be a valid UUID"),
];

const adminUpdateRoleBodyValidation = [
  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .toLowerCase()
    .isIn(Object.values(ROLES))
    .withMessage(`Invalid role. Valid roles: ${Object.values(ROLES).join(", ")}`),
];

const adminUpdateUserBodyValidation = [
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

  body("avatarUrl")
    .optional()
    .trim()
    .custom((value) => {
      if (value === null || value === "") return true;
      try {
        new URL(value);
        return true;
      } catch (err) {
        throw new Error("Avatar URL must be a valid URL");
      }
    }),
];

module.exports = {
  adminUserIdParamValidation,
  adminPostIdParamValidation,
  adminCommentIdParamValidation,
  adminUpdateRoleBodyValidation,
  adminUpdateUserBodyValidation,
};
